import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // FRONTEND_URL aceita uma ou mais origens separadas por virgula.
  const origens = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origem) => origem.trim())
    .filter((origem) => origem.length > 0);

  app.enableCors({
    origin: origens.length === 1 ? origens[0] : origens,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API rodando na porta ${port}`);
}

void bootstrap();
