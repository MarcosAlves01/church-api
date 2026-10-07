# Church API

API em NestJS + Prisma (PostgreSQL) para gestão de pessoas, produtos, vendas e usuários, com autenticação JWT via cookie de sessão.

## Requisitos

- Node.js 20+
- Docker e Docker Compose (para o banco e/ou para rodar a API em container)

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável         | Obrigatória | Descrição                                                                 |
| ---------------- | ----------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`   | sim         | String de conexão do PostgreSQL.                                          |
| `JWT_SECRET`     | sim         | Segredo forte para assinar os tokens. Não pode ser `default-secret`.      |
| `FRONTEND_URL`   | sim         | Origem(ns) autorizada(s) no CORS. Aceita várias separadas por vírgula.    |
| `ADMIN_EMAIL`    | prod        | E-mail do admin criado pelo seed.                                         |
| `ADMIN_SENHA`    | prod        | Senha do admin criado pelo seed.                                          |
| `NODE_ENV`       | não         | `development` (padrão) ou `production`.                                   |
| `PORT`           | não         | Porta da API (padrão `3000`).                                             |
| `JWT_EXPIRES_IN` | não         | Validade do token (padrão `8h`).                                          |

Gerar um `JWT_SECRET` forte:

```bash
openssl rand -base64 48
```

## Desenvolvimento local

Opção A — API local com hot reload (recomendado para dev):

```bash
docker compose up -d postgres   # sobe apenas o banco
npm install
npx prisma migrate deploy       # aplica as migrations
npm run seed                    # cria o admin (usa ADMIN_EMAIL/ADMIN_SENHA ou fallback dev)
npm run start:dev
```

Opção B — tudo em container (simula produção):

```bash
docker compose up -d --build
docker compose exec api npm run seed   # apenas na primeira vez
```

## Endpoints úteis

- `GET /health` — healthcheck público (`{ status: "ok" }`).
- `POST /auth/login` — login; retorna o token e seta o cookie `sessao`.
- `GET /auth/me` — dados do usuário autenticado.
- `POST /usuarios` — cria usuário (requer estar autenticado).
- CRUD de `/pessoas`, `/produtos`, `/vendas` e `GET /resumo`.

Observação: os IDs são inteiros sequenciais (não UUID). O front deve tratar
`id`, `pessoaId` e `produtoId` como números.

## Deploy (container)

O `Dockerfile` roda `prisma migrate deploy` automaticamente no boot. Fluxo geral:

1. Provisionar um PostgreSQL gerenciado e obter a `DATABASE_URL`.
2. Conectar o repositório à plataforma (ela detecta o `Dockerfile`).
3. Configurar as variáveis de ambiente no painel da plataforma:
   `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`,
   `ADMIN_EMAIL`, `ADMIN_SENHA`.
4. Fazer o deploy. As migrations são aplicadas no boot.
5. Rodar o seed uma vez para criar o admin:
   ```bash
   npm run seed
   ```
6. Testar o login:
   ```bash
   curl -i -X POST https://SUA_API/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"ADMIN_EMAIL","senha":"ADMIN_SENHA"}'
   ```

### Integração com o frontend

- Defina `FRONTEND_URL` na API com a origem exata do front (sem barra final).
- O front deve enviar credenciais nas requisições:
  - `fetch`: `credentials: 'include'`
  - `axios`: `withCredentials: true`
- Em produção o cookie de sessão é `secure` + `sameSite=none`, portanto **ambos**
  (API e front) precisam estar em **HTTPS**.

## Scripts

- `npm run start:dev` — desenvolvimento com watch.
- `npm run build` — compila para `dist/`.
- `npm run start:prod` — roda a build (`node dist/main`).
- `npm run seed` — cria/garante o usuário admin.
- `npm test` — testes unitários.
