import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

export const NOME_COOKIE = 'sessao';

function extrairTokenDoCookie(req: Request): string | null {
  const cookies =
    (req as unknown as { cookies?: Record<string, unknown> }).cookies ?? {};
  const token = cookies[NOME_COOKIE];

  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET não está definido.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extrairTokenDoCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: { sub: number; email: string }): {
    id: number;
    email: string;
  } {
    return { id: payload.sub, email: payload.email };
  }
}
