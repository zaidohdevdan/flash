# Dockerfile de Produção - FLASH (Contexto: raiz do repositório)
FROM oven/bun:latest

# Dependências do sistema para SSL e Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build do Frontend
COPY apps/web/package.json /app/frontend/package.json
WORKDIR /app/frontend
RUN bun install
COPY apps/web/ ./
RUN bun run build

# Configuração do Backend
WORKDIR /app/server
COPY server/package.json ./
RUN bun install --production
COPY server/ ./

# Copiar build do frontend para dentro da pasta server/dist
RUN mkdir -p /app/server/dist
RUN cp -r /app/frontend/dist/* /app/server/dist/

# Geração do cliente Prisma com bypass de URL
WORKDIR /app/server
RUN DATABASE_URL="mongodb://localhost:27017/unused" bun run db:generate

# Configuração de rede
ENV NODE_ENV=production

# Execução
CMD ["bun", "run", "start"]
