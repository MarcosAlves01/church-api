# Church API — Sistema de Gestão de Vendas

API REST da **Church Store**, o sistema de gestão de vendas criado para a lojinha do retiro da igreja. Responsável por autenticação, pessoas, produtos, vendas e pelos indicadores do painel de resumo (faturamento, ticket médio e controle de pagamento).

Este é o **back-end** da aplicação (NestJS + Prisma + PostgreSQL). O front-end é um projeto separado, desenvolvido em **Next.js**.

> ⚙️ Projeto tratado como **MVP**: o escopo foi reduzido ao essencial para ser usado em produção durante o evento. Paginação, filtros avançados, testes automatizados e otimizações de performance fazem parte do roadmap de evolução.

## ✨ Funcionalidades

- **Autenticação** com JWT e sessão via cookie `HttpOnly`
- **Usuários** — criação de usuários (requer estar autenticado)
- **Pessoas** — CRUD completo, com flag de pagamento (pago / pendente)
- **Produtos** — CRUD completo
- **Vendas** — registro de vendas vinculadas a pessoas e produtos, com preço capturado no momento da venda
- **Resumo** — indicadores de faturamento, ticket médio e status de pagamento por pessoa
- **Healthcheck** público (`/health`) para monitoramento e _cold start_
- **CORS** configurável por origem(ns)

## 🧱 Stack

- [NestJS 11](https://nestjs.com) + [TypeScript](https://www.typescriptlang.org)
- [Prisma 6](https://www.prisma.io) (ORM)
- [PostgreSQL 16](https://www.postgresql.org)
- [Passport](https://www.passportjs.org) + [passport-jwt](https://github.com/mikenicholson/passport-jwt) (autenticação JWT)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (hash de senhas)
- [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer) (validação de DTOs)
- [Docker](https://www.docker.com) + Docker Compose

## 🏛️ Arquitetura

A API é organizada por **módulos de domínio** em `src` (Auth, Usuários, Pessoas, Produtos, Vendas, Resumo), cada um com seu `controller`, `service` e DTOs. O acesso ao banco é centralizado em um `PrismaService`.

O front-end adota o padrão **BFF (Backend for Frontend)**: o navegador conversa com as rotas internas do Next.js, que repassam as requisições para esta API enviando o token via header `Authorization: Bearer <token>`.

```
Navegador  ──►  Next.js (rotas /api + cookie HttpOnly)  ──►  API NestJS  ──►  PostgreSQL
```

> 🔢 Os IDs são inteiros sequenciais (`autoincrement`), não UUID. O front trata `id`, `pessoaId` e `produtoId` como números.

## 🚀 Como rodar localmente

Pré-requisitos: Node.js 20+ e Docker + Docker Compose.

**Opção A — API local com hot reload (recomendado para dev):**

```bash
# 1. Sobe apenas o banco
docker compose up -d postgres

# 2. Instala as dependências
npm install

# 3. Configura as variáveis de ambiente
cp .env.example .env

# 4. Aplica as migrations
npx prisma migrate deploy

# 5. Cria o usuário admin (usa ADMIN_EMAIL / ADMIN_SENHA)
npm run seed

# 6. Sobe a API com watch
npm run start:dev
```

**Opção B — tudo em container (simula produção):**

```bash
docker compose up -d --build
docker compose exec api npm run seed   # apenas na primeira vez
```

A API sobe em [http://localhost:3000](http://localhost:3000).

## 🔑 Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. As principais:

| Variável         | Obrigatória | Descrição                                                              |
| ---------------- | ----------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`   | sim         | String de conexão do PostgreSQL                                        |
| `JWT_SECRET`     | sim         | Segredo forte para assinar os tokens (não pode ser `default-secret`)   |
| `FRONTEND_URL`   | sim         | Origem(ns) autorizada(s) no CORS; aceita várias separadas por vírgula  |
| `ADMIN_EMAIL`    | prod        | E-mail do admin criado pelo seed                                       |
| `ADMIN_SENHA`    | prod        | Senha do admin criado pelo seed                                        |
| `NODE_ENV`       | não         | `development` (padrão) ou `production`                                 |
| `PORT`           | não         | Porta da API (padrão `3000`)                                           |
| `JWT_EXPIRES_IN` | não         | Validade do token (padrão `8h`)                                        |

Gerar um `JWT_SECRET` forte:

```bash
openssl rand -base64 48
```

> ⚠️ Nunca commite o arquivo `.env` com valores reais. Apenas o `.env.example` deve ser versionado.

## 🔌 Endpoints principais

| Método | Rota             | Descrição                                            |
| ------ | ---------------- | ---------------------------------------------------- |
| `GET`  | `/health`        | Healthcheck público (`{ status: "ok" }`)             |
| `POST` | `/auth/login`    | Login; retorna o token e seta o cookie `sessao`      |
| `GET`  | `/auth/me`       | Dados do usuário autenticado                         |
| `POST` | `/usuarios`      | Cria usuário (requer autenticação)                   |
| CRUD   | `/pessoas`       | Cadastro, edição e exclusão de pessoas               |
| CRUD   | `/produtos`      | Cadastro, edição e exclusão de produtos              |
| CRUD   | `/vendas`        | Registro de vendas                                   |
| `GET`  | `/resumo`        | Indicadores do painel de resumo                      |

### Integração com o frontend

- Defina `FRONTEND_URL` com a origem exata do front (sem barra no final).
- O front deve enviar credenciais nas requisições (`fetch`: `credentials: 'include'`; `axios`: `withCredentials: true`).
- Em produção o cookie de sessão é `secure` + `sameSite=none`, portanto **API e front precisam estar em HTTPS**.

## 📜 Scripts

| Script               | Descrição                                     |
| -------------------- | --------------------------------------------- |
| `npm run start:dev`  | Inicia o ambiente de desenvolvimento (watch)  |
| `npm run build`      | Compila para `dist/`                          |
| `npm run start:prod` | Roda a build de produção (`node dist/main`)   |
| `npm run seed`       | Cria/garante o usuário admin                  |
| `npm run lint`       | Executa o linter                              |
| `npm test`           | Executa os testes unitários                   |

## 🗺️ Roadmap

- [ ] Paginação nas listagens
- [ ] Filtros e busca mais avançados
- [ ] Otimizações de performance
- [ ] Testes automatizados

## 📄 Licença

Projeto de uso pessoal/comunitário.
