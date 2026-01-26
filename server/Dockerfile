# Dockerfile - FLASH Backend API (Apenas servidor)
FROM oven/bun:latest

# Dependências do sistema para SSL e Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependências do backend
COPY package.json ./
RUN bun install --production

# Copiar código do servidor
COPY . .

# Gerar cliente Prisma
RUN DATABASE_URL="mongodb://localhost:27017/unused" bun run db:generate

# Configuração
ENV NODE_ENV=production

# Executar servidor
CMD ["bun", "run", "start"]
