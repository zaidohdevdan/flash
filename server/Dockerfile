# Dockerfile de Produção para FLASH (Bun + Prisma)
FROM oven/bun:latest

# Instalando dependências do sistema necessárias para o Prisma (OpenSSL)
RUN apt-get update && apt-get install -y openssl libc6

WORKDIR /app

# Copiar apenas o necessário para instalar dependências (Aproveita o Cache)
COPY package.json ./
RUN bun install

# Copiar o restante do código (incluindo a pasta prisma)
COPY . .

# Gerar o cliente do Prisma (essencial para o MongoDB)
# Passamos uma URL vazia apenas para o build não reclamar
RUN DATABASE_URL="mongodb://localhost:27017/unused" bun run db:generate

# Definir a porta de produção
ENV PORT=3000
EXPOSE 3000

# Usar o script de start definido no package.json
CMD ["bun", "run", "start"]
