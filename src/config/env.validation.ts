type RawEnv = Record<string, string | undefined>;

export interface EnvValidado {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
}

/**
 * Valida as variáveis de ambiente no startup. Lança erro (derrubando o boot)
 * se alguma variável obrigatória estiver ausente ou inválida.
 */
export function validarEnv(config: RawEnv): EnvValidado {
  const erros: string[] = [];

  const obrigatorias = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];
  for (const chave of obrigatorias) {
    if (!config[chave] || config[chave]?.trim() === '') {
      erros.push(`${chave} é obrigatória e não está definida.`);
    }
  }

  const jwtSecret = config.JWT_SECRET ?? '';
  if (jwtSecret === 'default-secret') {
    erros.push(
      'JWT_SECRET não pode usar o valor padrão inseguro "default-secret".',
    );
  }

  const port = config.PORT ? Number(config.PORT) : 3000;
  if (Number.isNaN(port)) {
    erros.push(`PORT deve ser um número. Valor recebido: "${config.PORT}".`);
  }

  if (erros.length > 0) {
    throw new Error(
      `Configuração de ambiente inválida:\n- ${erros.join('\n- ')}`,
    );
  }

  return {
    NODE_ENV: config.NODE_ENV ?? 'development',
    PORT: port,
    DATABASE_URL: config.DATABASE_URL as string,
    JWT_SECRET: config.JWT_SECRET as string,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN ?? '8h',
    FRONTEND_URL: config.FRONTEND_URL as string,
  };
}
