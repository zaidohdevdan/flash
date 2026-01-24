# Dockerfile para Bun no Koyeb
FROM oven/bun:latest

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./
RUN bun install

# Copiar o restante do código
COPY . .

# Gerar o cliente do Prisma
RUN bun run db:generate

# Expor a porta que o Koyeb vai usar
EXPOSE 3000

# Comando para rodar em produção
CMD ["bun", "src/index.ts"]
