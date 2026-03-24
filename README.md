# ⚡ Flash - Sistema de Gestão Operacional

> **Mission Control**: Supervisão e coordenação de equipes em tempo real com alta performance.

Flash é uma plataforma robusta de gestão operacional projetada para conectar supervisores e profissionais em campo de forma instantânea e eficiente.

## ✨ Funcionalidades Principais

- **📡 Monitoramento em Tempo Real**: Acompanhe a localização e status da equipe ao vivo.
- **💬 Comunicação Integrada**: Chat direto e em grupo.
- **📝 Relatórios Avançados**: Criação de relatórios com geolocalização e funcionamento offline.
- **🎨 Design Mission Control**: Interface de alto contraste otimizada para legibilidade e performance.
- **🔄 Sincronização Inteligente**: Suporte robusto para operação offline com Dexie.js.

## 🚀 Stack Tecnológico

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Bun, Express, Socket.io, Prisma
- **Database**: MongoDB (Atlas)
- **Local Database**: Dexie.js (IndexedDB)
- **Deploy**: Vercel (Web) + Railway (Server)

## 📦 Como Iniciar

### Pré-requisitos

- [Bun](https://bun.sh) (v1.0+)
- Node.js (v18+) - *Opcional, mas recomendado para algumas ferramentas*

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/flash.git

# Instale as dependências
bun install
```

### 🛠️ Desenvolvimento

```bash
# Iniciar Servidor e Web App simultaneamente
bun run dev

# Ou inicie separadamente:
bun run dev:server # Backend (Porta 3001)
bun run dev:web    # Frontend (Porta 5173)
```

## 🏗️ Estrutura do Projeto

- `apps/web`: Frontend React (SPA)
- `server`: API Backend e WebSocket Server
- `packages`: Pacotes compartilhados (UI Kit, tipos, etc.)

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz baseado no `.env.example`:

- `DATABASE_URL`: Connection string do MongoDB
- `JWT_SECRET`: Segredo para autenticação
- `VITE_API_URL`: URL da API (ex: <http://localhost:3001>)

---

Desenvolvido com ⚡ por [Seu Nome/Time]
