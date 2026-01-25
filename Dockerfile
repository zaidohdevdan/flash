# Dockerfile de Produção - FLASH Server
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
WORKDIR /app
COPY server/package.json ./
RUN bun install --production
COPY server/ ./

# Copiar build do frontend para o servidor
RUN mkdir -p /app/dist
RUN cp -r /app/frontend/dist/* /app/dist/

# Geração do cliente Prisma com bypass de URL
RUN DATABASE_URL="mongodb://localhost:27017/unused" bun run db:generate

# Configuração de rede
ENV NODE_ENV=production

# Execução
CMD ["bun", "run", "start"]
