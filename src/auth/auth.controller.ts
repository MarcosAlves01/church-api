import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { NOME_COOKIE } from './jwt.strategy';
import { Public } from './public.decorator';

const ehProducao = process.env.NODE_ENV === 'production';
const OPCOES_COOKIE = {
  httpOnly: true,
  secure: ehProducao,
  sameSite: ehProducao ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 8,
  path: '/',
} as const;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.authService.login(dto);
    res.cookie(NOME_COOKIE, token, OPCOES_COOKIE);
    return { token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(NOME_COOKIE, { ...OPCOES_COOKIE, maxAge: undefined });
    return { ok: true };
  }

  @Get('me')
  me(@Req() req: Request & { user: { id: number } }) {
    return this.authService.buscarUsuarioAutenticado(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() dto: RegistrarDto) {
    const { usuario } = await this.authService.registrar(dto);
    return { usuario };
  }
}
