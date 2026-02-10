# Documentação do Frontend (Web App)

O frontend do FLASH é uma Single Page Application (SPA) moderna, construída para ser rápida, responsiva e resiliente a falhas de conexão.

## Princípios de Design

O sistema utiliza um **Design de Alta Estética (Rich Aesthetics)** com foco em:

- **Glassmorphism**: Efeitos de transparência e desfoque em modais e sidebars.
- **Dark Mode First**: Toda a interface é otimizada para temas escuros, utilizando variáveis CSS dinâmicas.
- **Micro-interações**: Feedback visual imediato via Framer Motion e transições suaves.

## Organização de Componentes (`/src/components`)

### UI Kit (`/components/ui`)

Componentes atômicos e reutilizáveis:

- **Button**: Wrapper customizado com estados de loading e variantes.
- **Card**: Container padrão com estilização premium.
- **Modal**: Sistema centralizado de diálogos sobrepostos.
- **Avatar**: Gestão de imagens de perfil e fallbacks de iniciais.
- **NotificationDrawer**: Central de notificações lateral.

### Domain Components (`/components/domain`)

Componentes que contêm lógica de negócio, como `ReportCard`, `ChatWidget` e formulários específicos.

## Gestão de Estado e Contexto

### AuthContext (`/src/contexts/AuthContext.tsx`)

O coração da sessão do usuário:

- Mantém dados do usuário logado.
- Gerencia a persistência de tokens JWT no `LocalStorage`.
- Sincroniza preferências globais (Ex: Notificações sonoras/desktop).

### Socket.io Integration

Gerenciado principalmente via hooks (`useDashboardSocket`), permitindo que componentes reajam a eventos globais de forma isolada.

## Serviços e Persistência

- **API (`/src/services/api.ts`)**: Instância base do Axios com interceptadores de autenticação.
- **Offline Sync (`/src/services/offlineSync.ts`)**: Lógica para armazenar dados localmente (Dexie/IndexedDB) e sincronizar quando a rede retornar.
- **Dexie DB (`/src/services/db.ts`)**: Definição do esquema de banco de dados local para suporte offline.

## Configuração Visual (Design System)

Toda a estilização é baseada em variáveis CSS definidas no `index.css`:

- `--bg-primary`, `--bg-secondary`: Cores de fundo dinâmicas.
- `--accent-primary`: A cor de destaque (azul/branding).
- `--text-primary`, `--text-secondary`: Hierarquia tipográfica.

Para o Dark Mode, estas variáveis são sobrescritas mantendo a consistência visual.
