# Documentação de Deployment & DevOps

O FLASH utiliza um fluxo de deploy automatizado baseado em containers Docker, garantindo que o ambiente de desenvolvimento seja idêntico ao de produção.

## Estratégia de Deploy

Atualmente, o sistema é configurado para rodar no **Railway**, utilizando um modelo de monorepo onde o backend serve o frontend estático.

- **Frontend**: Compilado via `vite build` e servido pelo Express do Backend como arquivos estáticos na pasta `server/dist`.
- **Backend**: Servidor Bun rodando em um container Linux (Debian).

## Dockerfile e Build Process

O `Dockerfile` na raiz do projeto realiza um **Multi-stage Build**:

1. **Build Web**: Instala dependências do frontend e gera a pasta `dist`.
2. **Setup Server**: Instala dependências do backend (com `--production`).
3. **Merge**: Copia o build do frontend para dentro da estrutura do servidor.
4. **Finalize**: Gera o client do Prisma e define o comando de inicialização.

## Variáveis de Ambiente (`.env`)

O sistema exige as seguintes variáveis configuradas no ambiente de produção:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão do MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Chave para assinatura de tokens | `hash_secreta_aqui` |
| `PORT` | Porta de rede (padrão Railway) | `3000` |
| `CLOUDINARY_URL` | Configuração completa do Cloudinary | `cloudinary://...` |
| `NODE_ENV` | Ambiente de execução | `production` |

## Escalonamento e Performance

- **Horizontal Scaling**: O sistema suporta múltiplas instâncias (replicas). Nota: Como utilizamos WebSockets, recomenda-se o uso de "Sticky Sessions" se o balanceador de carga não suportar Redis como adapter.
- **Regiões**: Recomendado deploy em regiões geográficas próximas aos usuários finais (ex: US-East para América Latina) para reduzir a latência de sockets.

## Monitoramento

O log do container no Railway fornece visibilidade em tempo real sobre erros de banco de dados, conexões de sockets e requisições HTTP. Para auditoria interna de ações de usuários, consulte a página **Logs do Sistema** na interface administrativa do FLASH.
