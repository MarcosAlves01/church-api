import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@lojinha.com';
  const senhaHash = await bcrypt.hash('troque-esta-senha', 10);

  await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { nome: 'Admin', email, senhaHash },
  });

  console.log(`Usuário criado: ${email} (senha: troque-esta-senha)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
