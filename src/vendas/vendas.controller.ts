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
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { VendasService } from './vendas.service';

export class CreateVendaDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pessoaId!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  produtoId!: number;

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
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pessoaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  produtoId?: number;

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
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.vendasService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CreateVendaDto) {
    return this.vendasService.criar(dto);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVendaDto,
  ) {
    return this.vendasService.atualizar(id, dto);
  }

  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.vendasService.remover(id);
  }
}
