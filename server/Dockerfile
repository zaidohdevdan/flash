# Dockerfile de Produção - FLASH
FROM oven/bun:latest

# Dependências do sistema para SSL e Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalação limpa das dependências
COPY package.json ./
RUN bun install --production

# Copia o código
COPY . .

# Geração do cliente Prisma com bypass de URL
RUN DATABASE_URL="mongodb://localhost:27017/unused" bun run db:generate

# Configuração de rede (Fly.io usa PORT dinâmico)
ENV NODE_ENV=production

# Execução
CMD ["bun", "run", "start"]
