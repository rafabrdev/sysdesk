# 🎮 Sysdesk - Projeto BR SISTEMAS

> 💬 **Sysdesk** é um sistema de suporte em tempo real **on-premise** com **MariaDB + NestJS + Next.js + Redis + NGINX**, desenvolvido em monorepo, com foco em escalabilidade, LGPD e boas práticas de DevOps.

---

## 🏆 Gamified Sprint Log

Cada Sprint é uma **missão**.  
Cada Task é uma **quest**.  
O Agente deve atualizar este arquivo conforme for **completando os objetivos**.  

Use os **emojis de status**:
- ⬜ **Não iniciado**
- 🟨 **Em progresso**
- ✅ **Concluído**
- 🔒 **Bloqueado**

---

## 🚀 Progresso Geral

![Progress Bar](https://progress-bar.dev/0/?title=Sysdesk%20Completion)

---

## 📜 Missões (Sprints)

### 🛠 Sprint 0 – Arquitetura & Setup ✅
- ✅ **T0.001** Criar monorepo base (Next.js + NestJS + Prisma).
- ✅ **T0.002** Configurar Docker Compose (MariaDB, Redis, Backend, Frontend, NGINX).
- ✅ **T0.003** Criar schema inicial no Prisma + Seed.
- ✅ **T0.004** Configurar CI/CD (lint, test, build).

🎯 **Objetivo:** Ambiente rodando localmente com `docker compose up`, CI funcionando e seed criado.  

---

### 🔑 Sprint 1 – Autenticação & Convites 🟨
- ✅ **T1.001** Modelar tabelas: users, companies, invites, sessions.
- ⬜ **T1.002** Implementar Auth (JWT + Refresh + bcrypt).
- ⬜ **T1.003** Fluxo de registro por convite + RBAC.
- ⬜ **T1.004** Criar telas de Login/Register (Frontend).
- ⬜ **T1.005** Testes unitários + E2E Auth.

🎯 **Objetivo:** Registro apenas por convite, login funcionando, tokens salvos, proteção por roles.  

---

### 🎨 Sprint 2 – UI Base & Theming
- ⬜ **T2.001** Criar tema global (Tailwind + MUI/Shadcn).
- ⬜ **T2.002** Layout responsivo (Navbar, Sidebar, Footer).
- ⬜ **T2.003** Rotas protegidas com Auth Guard.
- ⬜ **T2.004** Testes de interface (RTL + Playwright).

🎯 **Objetivo:** Base visual pronta, login leva ao Dashboard estilizado.  

---

### 💬 Sprint 3 – Chat Core & Queue
- ⬜ **T3.001** Modelar tabelas (conversations, messages).
- ⬜ **T3.002** Gateway Socket.IO + Redis Adapter.
- ⬜ **T3.003** Persistência e histórico de mensagens.
- ⬜ **T3.004** Criar UI de chat (Cliente e Agente).
- ⬜ **T3.005** Teste E2E de chat em tempo real.

🎯 **Objetivo:** Cliente e operador trocando mensagens em tempo real.  

---

### 🎛 Sprint 4 – Fluxo do Operador & Dashboard
- ⬜ **T4.001** Implementar atribuição FIFO.
- ⬜ **T4.002** Tickets module.
- ⬜ **T4.003** Dashboard Manager com gráficos.
- ⬜ **T4.004** Testes de atribuição e métricas.

🎯 **Objetivo:** Operadores recebem chats automaticamente, admins visualizam métricas.  

---

### 📂 Sprint 5 – Histórico, Exportação & LGPD
- ⬜ **T5.001** Histórico por role.
- ⬜ **T5.002** Exportação PDF/CSV.
- ⬜ **T5.003** Esquecer meus dados (LGPD).
- ⬜ **T5.004** Testes de exportação e LGPD.

🎯 **Objetivo:** Usuário exporta e apaga seus dados conforme LGPD.  

---

### 🔒 Sprint 6 – Segurança Avançada
- ⬜ **T6.001** Hardening NGINX (TLS, headers).
- ⬜ **T6.002** Refresh Tokens + Logout seguro.
- ⬜ **T6.003** Gates de segurança no CI.

🎯 **Objetivo:** App com segurança reforçada e CI bloqueando vulnerabilidades.  

---

### 🏢 Sprint 7 – Administração & Multi-Tenancy
- ⬜ **T7.001** Configurações da empresa.
- ⬜ **T7.002** RBAC avançado (escopos por empresa).
- ⬜ **T7.003** Supervisor intervém em chats.

🎯 **Objetivo:** Gestão por empresa + supervisão ativa de chats.  

---

### ⚡ Sprint 8 – Performance & Stress Test
- ⬜ **T8.001** Cache Redis para métricas.
- ⬜ **T8.002** Teste de carga (100–200 usuários).
- ⬜ **T8.003** Índices e otimização de queries.

🎯 **Objetivo:** Garantir estabilidade sob carga moderada.  

---

### 📦 Sprint 9 – Deploy On-Premise
- ⬜ **T9.001** Manual de instalação e operação.
- ⬜ **T9.002** Scripts de backup e restore.
- ⬜ **T9.003** Monitoramento (Prometheus/Grafana).

🎯 **Objetivo:** Cliente instala em servidor on-prem e opera sozinho.  

---

## 🏅 Regras do Jogo

- Cada Sprint finalizada aumenta a **barra de progresso**.
- O Agente deve **atualizar este README.md** ao concluir cada tarefa.
- Todo commit deve conter o **ID da Task** e **Sprint**.
- Testes unitários + E2E obrigatórios para ✅ concluir uma missão.
- Auditoria de LGPD obrigatória para sprints 5 em diante.

---

## 📊 Scoreboard

- ✅ = Pontos de experiência (XP) +10
- 🟨 = Progresso em andamento
- 🔒 = Requer desbloqueio (dependência de outra Sprint)

---

## 🧙‍♂️ Dungeon Master (Agente IA)

> O **Agente** é o **Dungeon Master** deste jogo.  
> Ele deve interpretar o `project-manual.xml` e seguir os **workflows** do `WARP.md`.  
> Cada avanço precisa ser refletido neste log, como se fosse um **livro de aventuras de código**.

---

## 📝 Log de Atividades

### [S0][T0.001] - Estrutura inicial do monorepo com pnpm workspaces ✅
**Data:** 2025-09-01  
**Branch:** `sprint/S0_task_T0.001-monorepo-structure`  

**Resumo:**  
Criada a estrutura base do monorepo com três workspaces principais:
- **Frontend:** Next.js 15.5.2 com TypeScript, Tailwind CSS e App Router
- **Backend:** NestJS com TypeScript em modo strict
- **Database:** Prisma ORM configurado para MariaDB com schema inicial

**Arquivos principais criados:**
- `pnpm-workspace.yaml` - Configuração do monorepo
- `.env.example` - Template de variáveis de ambiente
- `database/prisma/schema_T0.001.prisma` - Schema inicial com modelos Company e User
- Configurações globais de ESLint, Prettier e TypeScript

**Validação:**
- ✅ Frontend compila sem erros (`pnpm build` no frontend)
- ✅ Backend compila sem erros (`pnpm build` no backend)
- ✅ Estrutura de monorepo funcional com pnpm workspaces
- ✅ TypeScript configurado em modo strict
- ✅ ESLint e Prettier configurados globalmente

**Próxima tarefa:** T0.002 - Configurar Docker Compose

---

### [S0][T0.002] - Docker Compose com MariaDB, Redis, NGINX ✅
**Data:** 2025-09-01  
**Branch:** `sprint/S0_task_T0.002-docker-compose`  

**Resumo:**  
Infraestrutura Docker completa configurada com todos os serviços necessários:
- **MariaDB 11:** Banco de dados relacional com healthcheck
- **Redis 7:** Cache e queue com persistência AOF
- **NGINX:** Reverse proxy com rate limiting e headers de segurança
- **Backend/Frontend:** Dockerfiles multi-stage otimizados
- **Mailhog:** Servidor SMTP para testes em desenvolvimento

**Arquivos principais criados:**
- `docker-compose.yml` - Orquestração de todos os serviços
- `docker-compose.override.yml` - Overrides para desenvolvimento
- `ops/nginx/nginx.conf` - Configuração NGINX com proxy reverso
- `backend/Dockerfile` e `frontend/Dockerfile` - Builds multi-stage
- `.env` - Variáveis de ambiente para desenvolvimento

**Features implementadas:**
- ✅ Healthchecks em todos os serviços
- ✅ Volumes persistentes para dados
- ✅ Network isolada (172.28.0.0/16)
- ✅ Rate limiting configurado
- ✅ Headers de segurança HTTP
- ✅ Usuários não-root em produção
- ✅ Hot reload em desenvolvimento
- ✅ Scripts npm para gerenciamento Docker

**Próxima tarefa:** T0.003 - Criar schema inicial no Prisma + Seed

---

### [S0][T0.003] - Schema Prisma inicial e seed ✅
**Data:** 2025-09-01  
**Branch:** `sprint/S0_task_T0.003-prisma-seed`  

**Resumo:**  
Schema completo do banco de dados criado com suporte para multi-tenancy, RBAC e LGPD:
- **5 tabelas principais:** companies, users, invites, sessions, audit_logs
- **Relações configuradas:** FK, índices e constraints
- **LGPD compliance:** Soft delete, audit trail, campos encriptados
- **Seed com dados de teste:** 2 empresas, 7 usuários, 3 convites

**Arquivos principais criados:**
- `database/prisma/schema_T0.003.prisma` - Schema completo do banco
- `database/seed/seed_T0.003.ts` - Script de seed com dados iniciais
- `tasks/T0.003/schema-docs.md` - Documentação detalhada do schema

**Dados de teste criados:**
- ✅ Empresa BR SISTEMAS com Master Admin
- ✅ Empresa TechCorp com 6 usuários (admin, operadores, clientes)
- ✅ 3 convites de teste (2 ativos, 1 expirado)
- ✅ Logs de auditoria iniciais
- ✅ Senhas hasheadas com bcrypt

**Credenciais de teste:**
- Master: admin@brsistemas.com.br / Master@Admin2025
- Admin: admin@techcorp.com.br / Sysdesk@2025
- Operador: maria.santos@techcorp.com.br / Sysdesk@2025
- Cliente: ana.costa@cliente.com.br / Sysdesk@2025

**Próxima tarefa:** T0.004 - Configurar CI/CD

---

### [S0][T0.004] - CI/CD com GitHub Actions ✅
**Data:** 2025-09-01  
**Branch:** `sprint/S0_task_T0.004-github-actions`  

**Resumo:**  
Pipeline completo de CI/CD configurado com GitHub Actions, incluindo análise de segurança:
- **CI Pipeline:** Lint, testes e build em matrix strategy
- **Security Pipeline:** SAST, dependency audit, license check, container scan
- **Automação:** Dependabot para atualização de dependências
- **Templates:** PR template para padronização

**Arquivos principais criados:**
- `.github/workflows/ci.yml` - Pipeline principal de CI
- `.github/workflows/security_T0.004.yml` - Pipeline de segurança
- `.github/dependabot.yml` - Configuração do Dependabot
- `.github/pull_request_template.md` - Template para PRs
- `tasks/T0.004/cicd-docs.md` - Documentação completa do CI/CD

**Features implementadas:**
- ✅ Matrix build (Node 20.x e 22.x)
- ✅ Cache de dependências pnpm
- ✅ CodeQL SAST analysis
- ✅ Trivy container scanning
- ✅ License compliance check
- ✅ Dependency audit automático
- ✅ Job summaries e reports
- ✅ Dependabot semanal para npm
- ✅ PR template estruturado

**Configurações necessárias no GitHub:**
- Secrets: `DOCKER_REGISTRY_URL`, `DOCKER_USERNAME`, `DOCKER_PASSWORD`
- Branch protection rules em `main`
- Labels para Dependabot: dependencies, security, docker

---

## 🎉 Sprint 0 Concluída!

**Status:** ✅ COMPLETA  
**Duração:** 1 dia  
**Tasks concluídas:** 4/4  

**Conquistas desbloqueadas:**
- 🏗️ **Arquiteto:** Estrutura monorepo configurada
- 🐳 **Docker Master:** Infraestrutura containerizada
- 🗄️ **Data Wizard:** Schema e seed prontos
- 🤖 **DevOps Hero:** CI/CD automatizado

**Ambiente pronto para desenvolvimento:**
```bash
# Iniciar todos os serviços
pnpm docker:up

# Rodar migrations e seed
pnpm db:migrate
pnpm db:seed

# Acessar aplicação
http://localhost  # Frontend via NGINX
http://localhost/api  # Backend via NGINX
```

**Próxima Sprint:** Sprint 1 - Autenticação & Convites

---

### [S1][T1.001] - Modelagem de tabelas Prisma para sistema de autenticação ✅
**Data:** 2025-09-01  
**Branch:** `sprint/S1_task_T1.001-prisma-models`  

**Resumo:**  
Modelos aprimorados para o sistema de autenticação com RBAC completo e multi-tenancy:
- **Modelos principais:** Company, User, Invite, Session, AuditLog
- **Enums adicionados:** Role, Plan, AuditAction, RiskLevel
- **Placeholders futuros:** Conversation, Message, Ticket (para Sprints 3-4)
- **Migration aplicada:** 20250901182215_add_auth_models_t1_001

**Melhorias implementadas:**
- ✅ Sistema de planos (TRIAL, BASIC, PROFESSIONAL, ENTERPRISE)
- ✅ Audit logging com type safety via enum AuditAction
- ✅ Risk assessment para auditoria (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Campos de segurança aprimorados (failedLoginAttempts, lockedUntil)
- ✅ Session tracking detalhado (device, browser, OS, location)
- ✅ Convites multi-uso suportados (maxUses, uses)
- ✅ Soft delete para LGPD compliance
- ✅ Índices otimizados para performance

**Arquivos criados/atualizados:**
- `database/prisma/schema_T1.001.prisma` - Schema completo atualizado
- `backend/prisma/schema.prisma` - Schema de produção
- `backend/prisma/migrations/20250901182215_add_auth_models_t1_001/` - Migration SQL
- `backend/generated/prisma/` - Cliente Prisma gerado
- `tasks/T1.001/` - Documentação da tarefa

**Validação:**
- ✅ Migration aplicada com sucesso no MariaDB
- ✅ Prisma Client gerado sem erros
- ✅ Permissões de banco configuradas para shadow database
- ✅ Estrutura de tabelas validada

**Próxima tarefa:** T1.002 - Implementar Backend Auth (JWT + Refresh + bcrypt)
