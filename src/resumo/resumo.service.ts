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
        pessoaId: true,
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

    // Agrupar vendas por pessoa e calcular o total gasto
    const gastosPorPessoa: Map<number, number> = new Map();
    vendas.forEach((venda) => {
      const totalVenda = venda.precoNaHora * venda.quantidade;
      const atual = gastosPorPessoa.get(venda.pessoaId) ?? 0;
      gastosPorPessoa.set(venda.pessoaId, atual + totalVenda);
    });

    // Buscar os dados das pessoas que tiveram vendas
    const pessoasComVendas = await this.prisma.pessoa.findMany({
      where: { id: { in: Array.from(gastosPorPessoa.keys()) } },
      select: { id: true, nome: true, telefone: true, pago: true },
    });

    // Mapear o resultado com o total gasto
    const pessoasComGastos = pessoasComVendas.map((pessoa) => ({
      id: pessoa.id,
      nome: pessoa.nome,
      telefone: pessoa.telefone,
      totalGasto: gastosPorPessoa.get(pessoa.id) ?? 0,
      pago: pessoa.pago,
    }));

    return {
      totalPessoas,
      totalProdutos,
      totalVendas,
      pessoasPagas,
      produtosAtivos,
      faturamentoTotal,
      valorMedioPorVenda,
      pessoasComVendas: pessoasComGastos,
    };
  }
}
