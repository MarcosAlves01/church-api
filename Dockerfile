# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependencias (incluindo dev) para compilar
COPY package*.json ./
RUN npm ci

# Copia o restante do codigo e gera o Prisma Client + build
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instala apenas as dependencias de producao
COPY package*.json ./
RUN npm ci --omit=dev

# Prisma precisa do schema/migrations em runtime (migrate deploy) e do client gerado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Aplica migrations e sobe a API. (O seed do admin e rodado separadamente.)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
