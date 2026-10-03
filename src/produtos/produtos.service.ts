import { Injectable, NotFoundException } from '@nestjs/common';
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

  async buscarPorId(id: string) {
    const produto = await this.prisma.produto.findUnique({ where: { id } });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  criar(dto: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: {
        nome: dto.nome,
        preco: dto.preco,
        ativo: dto.ativo ?? true,
      },
    });
  }

  async atualizar(id: string, dto: UpdateProdutoDto) {
    await this.buscarPorId(id);

    return this.prisma.produto.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.preco !== undefined && { preco: dto.preco }),
        ...(dto.ativo !== undefined && { ativo: dto.ativo }),
      },
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);

    await this.prisma.venda.deleteMany({
      where: { produtoId: id },
    });

    return this.prisma.produto.delete({
      where: { id },
    });
  }
}
