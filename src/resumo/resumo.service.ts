import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumoService {
  constructor(private readonly prisma: PrismaService) {}

  async obterResumo() {
    const [
      totalPessoas,
      totalProdutos,
      totalVendas,
      pessoasPagas,
      produtosAtivos,
    ] = await Promise.all([
      this.prisma.pessoa.count(),
      this.prisma.produto.count(),
      this.prisma.venda.count(),
      this.prisma.pessoa.count({ where: { pago: true } }),
      this.prisma.produto.count({ where: { ativo: true } }),
    ]);

    const vendas = await this.prisma.venda.findMany({
      select: {
        precoNaHora: true,
        quantidade: true,
      },
    });

    const faturamentoTotal = vendas.reduce(
      (total, venda) => total + venda.precoNaHora * venda.quantidade,
      0,
    );
    const valorMedioPorVenda =
      totalVendas > 0 ? Math.round(faturamentoTotal / totalVendas) : 0;

    return {
      totalPessoas,
      totalProdutos,
      totalVendas,
      pessoasPagas,
      produtosAtivos,
      faturamentoTotal,
      valorMedioPorVenda,
    };
  }
}
