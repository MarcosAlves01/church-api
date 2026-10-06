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
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ProdutosService } from './produtos.service';

export class CreateProdutoDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  preco!: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateProdutoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  preco?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  listar() {
    return this.produtosService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.buscarPorId(id);
  }

  @Post()
  criar(@Body() dto: CreateProdutoDto) {
    return this.produtosService.criar(dto);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProdutoDto,
  ) {
    return this.produtosService.atualizar(id, dto);
  }

  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.remover(id);
  }
}
