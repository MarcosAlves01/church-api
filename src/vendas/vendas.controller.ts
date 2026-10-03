import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { VendasService } from './vendas.service';

export class CreateVendaDto {
  @IsString()
  pessoaId!: string;

  @IsString()
  produtoId!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantidade!: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  precoNaHora!: number;
}

export class UpdateVendaDto {
  @IsOptional()
  @IsString()
  pessoaId?: string;

  @IsOptional()
  @IsString()
  produtoId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantidade?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  precoNaHora?: number;
}

@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Get()
  listar() {
    return this.vendasService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.vendasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CreateVendaDto) {
    return this.vendasService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: UpdateVendaDto) {
    return this.vendasService.atualizar(id, dto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.vendasService.remover(id);
  }
}
