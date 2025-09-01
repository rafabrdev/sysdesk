# Estrutura do Projeto - Task T0.001

## Estrutura de Diretórios Criada

```
sysdesk/
├── .env.example                  # Template de variáveis de ambiente
├── .eslintrc_T0.001.js          # Configuração global do ESLint
├── .gitignore                    # Arquivos ignorados pelo Git
├── .prettierrc_T0.001            # Configuração global do Prettier
├── package.json                  # Package.json raiz do monorepo
├── pnpm-workspace.yaml           # Configuração dos workspaces pnpm
├── tsconfig.base_T0.001.json    # TypeScript config base
├── project-manual.xml            # Manual do projeto (existente)
├── README.md                     # README principal (existente)
├── WARP.md                       # Regras do Warp (existente)
│
├── frontend/                     # Aplicação Next.js
│   ├── src/
│   │   └── app/                  # App Router do Next.js
│   ├── public/                   # Arquivos estáticos
│   ├── node_modules/
│   ├── next.config_T0.001.ts    # Configuração do Next.js
│   ├── next.config.ts            # Link para compatibilidade
│   ├── tsconfig_T0.001.json     # TypeScript config
│   ├── tsconfig.json             # Link para compatibilidade
│   ├── tailwind.config.ts       # Configuração do Tailwind
│   ├── postcss.config.mjs       # Configuração do PostCSS
│   ├── eslint.config.mjs        # ESLint do frontend
│   └── package.json              # Dependências do frontend
│
├── backend/                      # Aplicação NestJS
│   ├── src/
│   │   ├── app.controller.ts    # Controller principal
│   │   ├── app.service.ts       # Service principal
│   │   ├── app.module.ts        # Módulo raiz
│   │   └── main.ts               # Entry point
│   ├── test/                     # Testes E2E
│   ├── dist/                     # Build output
│   ├── node_modules/
│   ├── nest-cli_T0.001.json     # Configuração do NestJS CLI
│   ├── nest-cli.json            # Link para compatibilidade
│   ├── tsconfig_T0.001.json     # TypeScript config (strict)
│   ├── tsconfig.json             # Link para compatibilidade
│   ├── tsconfig.build.json      # Config para build
│   ├── eslint.config.mjs        # ESLint do backend
│   └── package.json              # Dependências do backend
│
├── database/                     # Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma         # Schema atual
│   │   └── schema_T0.001.prisma # Cópia com sufixo
│   ├── seed/                     # Scripts de seed (futuro)
│   ├── generated/                # Prisma Client gerado
│   ├── node_modules/
│   ├── .env                      # Env local do database
│   └── package.json              # Scripts do Prisma
│
└── tasks/                        # Tracking de tasks
    └── T0.001/
        ├── NOTES.md              # Notas de progresso
        ├── EVIDENCE.md           # Evidências de execução
        └── structure_T0.001.md   # Este arquivo

```

## Tecnologias Configuradas

### Frontend (Next.js)
- **Framework**: Next.js 15.5.2
- **React**: 19.1.0
- **TypeScript**: 5.9.2
- **Styling**: Tailwind CSS 4.1.12
- **Linting**: ESLint 9.34.0
- **Build**: Turbopack

### Backend (NestJS)
- **Framework**: NestJS (latest)
- **TypeScript**: Configurado em modo strict
- **Runtime**: Node.js
- **Testing**: Jest configurado
- **Architecture**: Modular com decorators

### Database (Prisma)
- **ORM**: Prisma 6.15.0
- **Database**: MariaDB (MySQL provider)
- **Schema**: Modelos iniciais para Company e User
- **RBAC**: Roles definidos (MASTER_ADMIN, ADMIN, OPERADOR, CLIENTE)

### DevOps & Tools
- **Package Manager**: pnpm 10.14.0
- **Monorepo**: pnpm workspaces
- **Linting**: ESLint global configurado
- **Formatting**: Prettier configurado
- **TypeScript**: Base config compartilhado
- **Version Control**: Git com branch conventions

## Próximos Passos (Sprint 0)

1. **T0.002**: Configurar Docker Compose com todos os serviços
2. **T0.003**: Criar migrations e seed inicial
3. **T0.004**: Configurar CI/CD com GitHub Actions

## Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Build all workspaces
pnpm build

# Run dev servers
pnpm dev

# Frontend specific
cd frontend && pnpm dev
cd frontend && pnpm build

# Backend specific
cd backend && pnpm start:dev
cd backend && pnpm build

# Database
cd database && pnpm db:generate
cd database && pnpm db:migrate
```

## Validação

✅ Frontend compila sem erros
✅ Backend compila sem erros
✅ Estrutura de monorepo funcional
✅ TypeScript em modo strict
✅ ESLint e Prettier configurados
✅ Schema Prisma inicial criado
