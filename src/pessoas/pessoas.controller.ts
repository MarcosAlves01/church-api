import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { PessoasService } from './pessoas.service';

export class CreatePessoaDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsBoolean()
  pago?: boolean;
}

export class UpdatePessoaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsBoolean()
  pago?: boolean;
}

@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Get()
  listar() {
    return this.pessoasService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.pessoasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CreatePessoaDto) {
    return this.pessoasService.criar(dto);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePessoaDto,
  ) {
    return this.pessoasService.atualizar(id, dto);
  }

  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.pessoasService.remover(id);
  }
}
