import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async buscarPorId(id: number) {
    const pessoa = await this.prisma.pessoa.findUnique({ where: { id } });

    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    return pessoa;
  }

  private async validarTelefoneUnico(telefone?: string | null, ignorarId?: number) {
    if (!telefone) {
      return;
    }

    const existente = await this.prisma.pessoa.findFirst({
      where: { telefone },
    });

    if (existente && existente.id !== ignorarId) {
      throw new ConflictException('Já existe uma pessoa com este telefone');
    }
  }

  async criar(dto: CreatePessoaDto) {
    await this.validarTelefoneUnico(dto.telefone);

    return this.prisma.pessoa.create({
      data: {
        nome: dto.nome,
        telefone: dto.telefone ?? null,
        pago: dto.pago ?? false,
      },
    });
  }

  async atualizar(id: number, dto: UpdatePessoaDto) {
    await this.buscarPorId(id);
    await this.validarTelefoneUnico(dto.telefone, id);

    return this.prisma.pessoa.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.pago !== undefined && { pago: dto.pago }),
      },
    });
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    await this.prisma.venda.deleteMany({
      where: { pessoaId: id },
    });

    return this.prisma.pessoa.delete({
      where: { id },
    });
  }
}
