import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ehProducao = process.env.NODE_ENV === 'production';

function obterCredenciaisAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_SENHA;

  if (ehProducao) {
    if (!email || !senha) {
      throw new Error(
        'ADMIN_EMAIL e ADMIN_SENHA precisam estar definidos no ambiente para rodar o seed em produção.',
      );
    }
    return { email, senha };
  }

  // Fallback apenas para desenvolvimento local.
  return {
    email: email ?? 'admin@lojinha.com',
    senha: senha ?? '123456',
  };
}

async function main() {
  const { email, senha } = obterCredenciaisAdmin();
  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.upsert({
    where: { email },
    update: { nome: 'Admin', senhaHash },
    create: { nome: 'Admin', email, senhaHash },
  });

  console.log(`Usuário criado ou atualizado: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
