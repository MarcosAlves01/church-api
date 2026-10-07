import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const SELECT_PUBLICO = {
  id: true,
  nome: true,
  email: true,
  criadoEm: true,
  atualizadoEm: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.usuario.findMany({
      select: SELECT_PUBLICO,
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: SELECT_PUBLICO,
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  async criar(dto: CreateUsuarioDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existente) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    return this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
      },
      select: SELECT_PUBLICO,
    });
  }

  async atualizar(id: number, dto: UpdateUsuarioDto) {
    await this.buscarPorId(id);

    if (dto.email !== undefined) {
      const existente = await this.prisma.usuario.findUnique({
        where: { email: dto.email },
      });

      if (existente && existente.id !== id) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }

    const senhaHash =
      dto.senha !== undefined ? await bcrypt.hash(dto.senha, 10) : undefined;

    return this.prisma.usuario.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(senhaHash !== undefined && { senhaHash }),
      },
      select: SELECT_PUBLICO,
    });
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    return this.prisma.usuario.delete({
      where: { id },
      select: SELECT_PUBLICO,
    });
  }
}
