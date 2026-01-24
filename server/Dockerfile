# Dockerfile de Produção - FLASH
FROM oven/bun:latest

# Dependências do sistema para SSL e Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates

WORKDIR /app

# Instalação limpa das dependências
COPY package.json ./
RUN bun install

# Copia o código
COPY . .

# Geração do cliente Prisma com bypass de URL
RUN DATABASE_URL="mongodb://localhost:27017/unused" bun prisma generate

# Configuração de rede
ENV PORT=3000
EXPOSE 3000

# Execução
CMD ["bun", "run", "start"]
