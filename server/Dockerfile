# Dockerfile de Produção - FLASH (Bun + Prisma + MongoDB)
FROM oven/bun:latest

# Instalando dependências críticas do sistema
# ca-certificates é essencial para conexões SSL com MongoDB Atlas
RUN apt-get update && apt-get install -y openssl ca-certificates libc6

WORKDIR /app

# Instalação de dependências
COPY package.json ./
RUN bun install

# Copia o código fonte
COPY . .

# Geração do Cliente Prisma
# Usamos bun x para garantir o uso da versão correta e silenciamos avisos de DB
RUN DATABASE_URL="mongodb://localhost:27017/unused" bun x prisma generate

# Porta de produção
ENV PORT=3000
EXPOSE 3000

# Script oficial de inicialização
CMD ["bun", "run", "start"]
