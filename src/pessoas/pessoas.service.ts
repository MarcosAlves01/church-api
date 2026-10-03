import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePessoaDto, UpdatePessoaDto } from './pessoas.controller';

@Injectable()
export class PessoasService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.pessoa.findMany({
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscarPorId(id: string) {
    const pessoa = await this.prisma.pessoa.findUnique({ where: { id } });

    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    return pessoa;
  }

  criar(dto: CreatePessoaDto) {
    return this.prisma.pessoa.create({
      data: {
        nome: dto.nome,
        telefone: dto.telefone ?? null,
        pago: dto.pago ?? false,
      },
    });
  }

  async atualizar(id: string, dto: UpdatePessoaDto) {
    await this.buscarPorId(id);

    return this.prisma.pessoa.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.pago !== undefined && { pago: dto.pago }),
      },
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);

    await this.prisma.venda.deleteMany({
      where: { pessoaId: id },
    });

    return this.prisma.pessoa.delete({
      where: { id },
    });
  }
}
