import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendaDto, UpdateVendaDto } from './vendas.controller';

@Injectable()
export class VendasService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.venda.findMany({
      include: {
        pessoa: true,
        produto: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    const venda = await this.prisma.venda.findUnique({
      where: { id },
      include: { pessoa: true, produto: true },
    });

    if (!venda) {
      throw new NotFoundException('Venda não encontrada');
    }

    return venda;
  }

  async criar(dto: CreateVendaDto) {
    await this.validarRelacionamentos(dto.pessoaId, dto.produtoId);

    return this.prisma.venda.create({
      data: {
        pessoaId: dto.pessoaId,
        produtoId: dto.produtoId,
        quantidade: dto.quantidade,
        precoNaHora: dto.precoNaHora,
      },
      include: {
        pessoa: true,
        produto: true,
      },
    });
  }

  async atualizar(id: number, dto: UpdateVendaDto) {
    await this.buscarPorId(id);

    if (dto.pessoaId) {
      await this.validarRelacionamentos(
        dto.pessoaId,
        dto.produtoId ?? undefined,
      );
    }

    if (dto.produtoId) {
      await this.validarRelacionamentos(
        dto.pessoaId ?? undefined,
        dto.produtoId,
      );
    }

    return this.prisma.venda.update({
      where: { id },
      data: {
        ...(dto.pessoaId !== undefined && { pessoaId: dto.pessoaId }),
        ...(dto.produtoId !== undefined && { produtoId: dto.produtoId }),
        ...(dto.quantidade !== undefined && { quantidade: dto.quantidade }),
        ...(dto.precoNaHora !== undefined && { precoNaHora: dto.precoNaHora }),
      },
      include: {
        pessoa: true,
        produto: true,
      },
    });
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    return this.prisma.venda.delete({
      where: { id },
    });
  }

  private async validarRelacionamentos(pessoaId?: number, produtoId?: number) {
    if (pessoaId) {
      const pessoaExiste = await this.prisma.pessoa.findUnique({
        where: { id: pessoaId },
      });

      if (!pessoaExiste) {
        throw new NotFoundException('Pessoa não encontrada');
      }
    }

    if (produtoId) {
      const produtoExiste = await this.prisma.produto.findUnique({
        where: { id: produtoId },
      });

      if (!produtoExiste) {
        throw new NotFoundException('Produto não encontrado');
      }
    }
  }
}
