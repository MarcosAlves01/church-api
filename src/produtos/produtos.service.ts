import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto, UpdateProdutoDto } from './produtos.controller';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.produto.findMany({
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    const produto = await this.prisma.produto.findUnique({ where: { id } });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  private async validarNomeUnico(nome?: string, ignorarId?: number) {
    if (!nome) {
      return;
    }

    const existente = await this.prisma.produto.findFirst({
      where: { nome: { equals: nome, mode: 'insensitive' } },
    });

    if (existente && existente.id !== ignorarId) {
      throw new ConflictException('Já existe um produto com este nome');
    }
  }

  async criar(dto: CreateProdutoDto) {
    await this.validarNomeUnico(dto.nome);

    return this.prisma.produto.create({
      data: {
        nome: dto.nome,
        preco: dto.preco,
        ativo: dto.ativo ?? true,
      },
    });
  }

  async atualizar(id: number, dto: UpdateProdutoDto) {
    await this.buscarPorId(id);
    await this.validarNomeUnico(dto.nome, id);

    return this.prisma.produto.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.preco !== undefined && { preco: dto.preco }),
        ...(dto.ativo !== undefined && { ativo: dto.ativo }),
      },
    });
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    await this.prisma.venda.deleteMany({
      where: { produtoId: id },
    });

    return this.prisma.produto.delete({
      where: { id },
    });
  }
}
