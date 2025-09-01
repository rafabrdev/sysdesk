This file provides guidance to **WARP (warp.dev)** when working with code in this repository.
It defines the complete workflow, naming conventions, task execution protocol, and sprint roadmap for the **Sysdesk** project by **BR SISTEMAS**.

---

## Project Context

**Sysdesk** is a support chat system designed for Brazilian businesses with on-premise deployment, multi-tenant architecture, real-time messaging, queue management, and LGPD compliance.

The project follows a **strict XML-driven development methodology** defined in `project-manual.xml`.

---

## Critical Files to Read First

**ALWAYS read `project-manual.xml` before starting any work.** It contains:

* Complete sprint and task definitions
* Database schema specifications
* API endpoint mappings
* Agent operating procedures
* Naming conventions and file structures

---

## Development Workflow

### Task Execution Protocol

1. **Identify current task**: Parse `project-manual.xml` to find next pending task.
2. **Create task folder**: `/tasks/T{S}.{NNN}/` with tracking files.
3. **Implement with suffixes**: All created/modified files must include task ID (e.g., `chat_T3.003.tsx`).
4. **Validate locally**: Run linters and tests before committing.
5. **Git operations**: Follow branch/commit conventions from manual.
6. **Update README**: Append task summary after completion.

### Naming Conventions

* **Task IDs**: `T{Sprint}.{Number}` (e.g., `T1.001`).
* **Branches**: `sprint/S{S}_task_T{S}.{NNN}-{short-desc}`
* **Commits**: `[S{S}][T{S}.{NNN}] - description`
* **PR titles**: `PR: S{S} - T{S}.{NNN} - description`
* **File suffixes**: `filename_T{S}.{NNN}.ext`

---

## Technology Stack

### Frontend

* **Framework**: Next.js (React) with TypeScript
* **UI Components**: Material UI or Shadcn/UI
* **Styling**: Tailwind CSS with global theme
* **Real-time**: Socket.IO client hooks
* **Testing**: Jest + React Testing Library + Playwright (E2E)

### Backend

* **Framework**: NestJS (Node.js)
* **Database**: MariaDB with Prisma ORM
* **Real-time**: Socket.IO with Redis adapter
* **Auth**: JWT + Refresh Tokens with bcrypt
* **Testing**: Jest (unit/integration)

### Infrastructure

* **Container**: Docker with docker-compose
* **Proxy**: NGINX reverse proxy
* **Queue**: Redis for chat queue and WebSocket scaling
* **CI/CD**: GitHub Actions
* **MCP Providers**: filesystem, github, context7, playwright, manual-xml

---

## Common Commands

### Development

```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run start:dev

# Database migrations
npx prisma migrate dev
node ./database/seed/seed.js

# Build apps
npm run build --prefix frontend
npm run build --prefix backend

# Docker environment
docker compose up --build
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npx playwright test --project=chromium

# Lint
npm run lint
```

---

## Project Structure

```
/
├── project-manual.xml      # Sprint/task definitions (DO NOT MODIFY)
├── README.md              # Living sprint log document
├── docker-compose.yml     # Container orchestration
├── .env.example           # Environment variables template
├── ops/
│   ├── warp.yaml          # Warp workflows
│   ├── mcp-server/        # MCP server configs
│   ├── tests/playwright/  # E2E test specs
│   └── erp/               # ERP integration mappings
├── frontend/              # Next.js app
│   └── src/
│       ├── pages/         # Routes with task suffixes
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom React hooks
│       └── styles/        # Theme tokens & global styles
├── backend/               # NestJS app
│   └── src/
│       └── modules/
│           ├── auth/      # JWT authentication
│           ├── users/     # User management
│           ├── chats/     # Chat logic
│           ├── tickets/   # Support tickets
│           ├── metrics/   # Analytics
│           └── exports/   # PDF/CSV generation
├── database/              # Prisma schemas and migrations
│   ├── migrations/
│   └── seed/
└── tasks/                 # Auto-created task folders
    └── T{S}.{NNN}/
```

---

## Core Database Tables

* **companies**: Multi-tenant company records
* **users**: Company-scoped users with roles (master\_admin, admin, operator, client)
* **conversations**: Chat sessions with queue status
* **messages**: Chat messages with attachments
* **tickets**: Support ticket records
* **evaluations**: Conversation ratings
* **audit\_logs**: LGPD compliance tracking
* **metrics\_cache**: Pre-computed analytics

---

## API Architecture

### Public Endpoints

* `/api/auth/*` – Authentication flows
* `/api/conversations/*` – Client chat operations
* `/api/conversations/{id}/attachments` – File uploads

### Internal Endpoints

* `/api/agents/*` – Agent queue and assignment
* `/api/manager/*` – Management dashboard
* `/api/export/*` – PDF/CSV exports
* `/api/audit/*` – Compliance logs

---

## MCP Integration Requirements

1. **filesystem MCP**: validate files before modifications
2. **context7 MCP**: consult for updated stack best practices
3. **playwright MCP**: execute UI flow tests after implementation
4. **github MCP**: handle commits, branches, PRs
5. **manual-xml MCP**: parse sprint tasks and requirements

---

## Security & Compliance

### LGPD Requirements

* Password hashing with bcrypt
* AES-256 encryption for sensitive fields (CPF/CNPJ)
* Audit logging for sensitive operations
* Data export & deletion endpoints
* Consent recording & retention policies

### Security Checklist per Sprint

* TLS enforced in production (NGINX + certs)
* Dependency vulnerability scanning
* SAST in CI pipeline
* Secrets via environment variables
* Personal data retention policy enforced

---

## Sprint Progression (S0–S9)

1. **S0** – Setup repo, Docker, infra base (MariaDB, Redis, NGINX)
2. **S1** – Auth + user management (JWT, invites, roles)
3. **S2** – Frontend theming, global styles, navigation
4. **S3** – Chat core (Socket.IO + Redis, queue, persistence)
5. **S4** – Agent workflows & manager dashboard
6. **S5** – History, exports (PDF/CSV), LGPD compliance
7. **S6** – Security hardening, refresh tokens, CI/CD prod
8. **S7** – Multi-company dashboards, advanced roles
9. **S8** – Performance, load testing, scalability
10. **S9** – Deploy on-premise with docs, backups, monitoring

---

## Task Validation Requirements

### Quality Gates

* Lint errors fixed before commit
* Unit test coverage ≥ 70% (backend)
* E2E flows (login, chat, export) must pass
* No critical vulnerabilities in dependencies
* PR review before merge

### Task Completion Checklist

* [ ] Task folder created in `/tasks/`
* [ ] Files include task ID suffix
* [ ] Local validation passed (lint, build, test)
* [ ] E2E tests executed via Playwright MCP
* [ ] Git commit follows convention
* [ ] README updated with task summary
* [ ] Audit log entry created

---

## Environment Variables

See `.env.example`. Key configs:

* `DATABASE_URL` – MariaDB connection string
* `JWT_SECRET` – Token signing secret
* `JWT_REFRESH_SECRET` – Refresh token secret
* `SOCKET_PORT` – WebSocket server port
* `REDIS_URL` – Redis connection
* `SMTP_HOST` – Mail service
* `RETENTION_DAYS` – LGPD retention period

---

## Working with the Manual

The `project-manual.xml` is the **single source of truth**:

* Sprint/task definitions
* Database schema
* API contracts
* Naming conventions
* Operating procedures
* Validation rules

**Never modify `project-manual.xml`.**