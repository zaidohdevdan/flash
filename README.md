# Flash - Sistema de Gestão Operacional

Sistema de gestão operacional em tempo real para supervisão e coordenação de equipes.

## 🚀 Tecnologias

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Bun + Express + Prisma
- **Real-time**: Socket.io
- **Database**: PostgreSQL
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 📦 Instalação

```bash
bun install
```

## 🛠️ Desenvolvimento

Para rodar ambos (servidor e web app):

```bash
bun run dev
```

Para rodar especificamente:

- Web app: `bun run dev:web`
- Server: `bun run dev:server`

## 🏗️ Build

```bash
# Frontend
cd apps/web && bun run build

# Backend
cd server && bun run build
```

## 📝 Variáveis de Ambiente

Configure as variáveis necessárias em `.env`:

- `DATABASE_URL`: URL do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT
- `CLOUDINARY_*`: Credenciais do Cloudinary

---

**Última atualização**: 2026-02-06
