# Manual do Sistema — Inovar App (Documentação Técnica)

Este documento descreve a arquitetura, as tecnologias e a estrutura de desenvolvimento do **Inovar App**. 

---

## 1. Tecnologias Core (Stack do Sistema)
O sistema foi desenvolvido utilizando as seguintes tecnologias de software:

- **Frontend:** Next.js 15 (App Router), React 19 e Tailwind CSS.
- **Backend:** Next.js Route Handlers (API moderna integrada).
- **Banco de Dados:** PostgreSQL (Managed on Cloud via Easypanel).
- **ORM:** Prisma Client (v5.22.0) — Mapeador Objeto-Relacional para interações com o DB.
- **Gerenciamento de Estado:** React Context API (PageTitleContext, AuthContext, etc.).
- **Querying:** Tanstack React Query (v5) — Para busca e cache de dados de clientes e OS.
- **UI & Animações:** Lucide React (ícones), Shadcn/UI (base de componentes), Framer Motion e Radix UI.
- **Drag-and-Drop:** @dnd-kit (Sortable e Core) — Para movimentação de cards no Kanban.

## 2. Arquitetura de Pastas
- `app/`: Contém as rotas da aplicação (Dashboard, Kanban, Alunos, Clientes, API).
- `src/components/`: Componentes reutilizáveis do sistema dividos por módulos (layout, kanban, dashboard, ui).
- `src/services/`: Camada de abstração para chamadas a APIs externas e n8n.
- `src/hooks/`: Custom hooks para gerenciamento de dados e estatísticas (useOS, useAuth).
- `prisma/`: Definições do esquema do banco de dados (`schema.prisma`) e migrações.
- `public/`: Ativos estáticos como logos e imagens (SVG, PNG).

## 3. Integrações de Terceiros (n8n Webhooks)
O Inovar App comunica-se com fluxos de automação externos via webhooks do n8n:
- **N8N_WEBHOOK_BASE:** Sincronização central de Ordens de Serviço (OS) oriundas de vendas.
- **N8N_SUPORTE_WEBHOOK:** Integração com o Agente Sophia (Chatbot IA) para suporte via WhatsApp.
- **SGE Proxy:** Proxy para interações financeiras protegidas com o sistema SGE legado.

## 4. Variáveis de Ambiente (.env)
Configurações cruciais para o funcionamento do sistema em diferentes ambientes:
- `DATABASE_URL`: URI de conexão com o banco PostgreSQL.
- `JWT_SECRET`: Chave secreta para assinatura de tokens de sessão.
- `NEXT_PUBLIC_APP_URL`: URL base do sistema (utilizada em redirecionamentos e metatags).
- `NEXT_PUBLIC_APP_PASSWORD`: Chave de acesso legada (mantida por compatibilidade).

## 5. Deployment e CI/CD
O deploy contínuo é realizado via **Easypanel/Nixpacks** conectado ao repositório GitHub.
- **Build:** `npx prisma generate && npm run build`
- **Start:** `npm start`
- O banco de dados é provisionado localmente ou via Docker, conforme definido no `docker-compose.yml`.

---

© 2026 Inovar Produções. Equipe de Desenvolvimento.
