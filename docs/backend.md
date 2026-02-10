# Documentação do Backend (API & Servidor)

O backend do FLASH é uma API RESTful e um servidor de WebSockets construído com **Bun** e **Express.js**, focado em performance e segurança.

## Banco de Dados (Prisma & MongoDB)

Utilizamos o **Prisma ORM** com **MongoDB**. Os principais modelos de dados são:

- **User**: Gerencia identidades, papeis (ADMIN, SUPERVISOR, etc.) e relações de hierarquia.
- **Report**: O núcleo do sistema; armazena comentários, imagens, geolocalização e status.
- **ReportHistory**: Rastreia cada mudança de status de um relatório para fins de auditoria.
- **Media**: Referências a arquivos no Cloudinary (imagens e áudios).
- **ChatMessage**: Mensagens de chat privadas com suporte a autodestruição (expiração).
- **Notification**: Sistema de alertas globais (agendamentos, convites, encaminhamentos).
- **AuditLog**: Registro de ações críticas para administradores.

## API REST Reference

As rotas estão protegidas por `AuthMiddleware` (JWT) e, em casos específicos, `AdminMiddleware`.

### Autenticação & Usuários

- `POST /login`: Login e geração de token.
- `POST /register`: Cadastro de novos usuários (apenas ADMIN).
- `GET /subordinates`: Lista usuários sob comando do supervisor logado.
- `GET /users`: Gestão completa de usuários (apenas ADMIN).

### Relatórios (Reports)

- `POST /reports`: Criação de novo relatório (Profissional).
- `GET /reports`: Listagem com filtros para supervisores.
- `PATCH /reports/:id/status`: Atualização de fluxo (Supervisor).
- `GET /reports/stats`: Dados analíticos para o dashboard.

### Mídia (Media)

- `POST /reports/:reportId/media`: Upload de evidências para um relatório.
- `POST /chat/media`: Upload temporário para mensagens de voz/imagem no chat.

### Videoconferência (War Room)

- `POST /conference/create`: Gera sala Jitsi e notifica participantes.
- `POST /conference/invite`: Convite dinâmico para novos membros.

## Eventos em Tempo Real (Socket.io)

O servidor mantém salas (rooms) para comunicação segmentada:

- `user-id`: Sala privada do usuário para notificações.
- `dept-id`: Sala do departamento para alertas coletivos.
- `admin-monitor`: Broadcast de logs de auditoria em tempo real.
- `private-chat-room`: Sala temporária entre dois usuários.

### Eventos Principais

- `connection`: Registra o usuário como online.
- `private_message`: Envio e persistência de mensagens de chat.
- `new_chat_notification`: Alerta visual para o destinatário.
- `user_online` / `user_offline`: Sincronização de presença global.

## Serviços e Jobs

- **ChatService**: Lógica de persistência e expiração de mensagens.
- **AuditService**: Centraliza a criação de logs de segurança.
- **Scheduler (Cron)**: Tarefas agendadas como lembretes de agenda e limpeza de mídia expirada.
