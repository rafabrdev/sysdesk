# Estrutura Docker - Task T0.002

## Visão Geral

Infraestrutura completa Docker configurada para o projeto Sysdesk com todos os serviços necessários para desenvolvimento e produção.

## Arquitetura dos Serviços

```
┌────────────────────────────────────────────────┐
│              NGINX (porta 80/443)              │
│            Reverse Proxy / Load Balancer       │
└────────┬──────────────────┬────────────────────┘
         │                  │
    ┌────▼────┐        ┌────▼────┐
    │Frontend │        │ Backend │
    │  :3000  │        │  :3333  │
    └─────────┘        └────┬────┘
                            │
                ┌───────────┴───────────┐
                │                       │
          ┌─────▼─────┐          ┌─────▼─────┐
          │  MariaDB  │          │   Redis   │
          │   :3306   │          │   :6379   │
          └───────────┘          └───────────┘
```

## Serviços Configurados

### 1. **MariaDB** (Database)
- **Imagem**: mariadb:11
- **Porta**: 3306
- **Volume**: db_data
- **Healthcheck**: Verifica conexão e inicialização do InnoDB
- **Configurações**:
  - Database: sysdesk
  - Usuário: sysdesk
  - Senha: Configurável via .env

### 2. **Redis** (Cache/Queue)
- **Imagem**: redis:7-alpine
- **Porta**: 6379
- **Volume**: redis_data
- **Healthcheck**: redis-cli ping
- **Configurações**:
  - Persistência AOF habilitada
  - Senha opcional via .env

### 3. **Backend** (NestJS)
- **Build**: Multi-stage Dockerfile
- **Porta**: 3333
- **Volume**: Código fonte em desenvolvimento
- **Healthcheck**: GET /health
- **Features**:
  - TypeScript strict mode
  - Hot reload em desenvolvimento
  - Usuário não-root em produção

### 4. **Frontend** (Next.js)
- **Build**: Multi-stage Dockerfile
- **Porta**: 3000
- **Volume**: Código fonte em desenvolvimento
- **Healthcheck**: GET /
- **Features**:
  - Standalone output
  - Hot reload em desenvolvimento
  - Otimização de imagem

### 5. **NGINX** (Reverse Proxy)
- **Imagem**: nginx:alpine
- **Porta**: 80 (HTTP), 443 (HTTPS ready)
- **Volume**: Configurações e cache
- **Healthcheck**: GET /health
- **Features**:
  - Proxy para frontend e backend
  - WebSocket support
  - Rate limiting
  - Headers de segurança
  - Gzip compression
  - Cache de assets estáticos

### 6. **Mailhog** (Desenvolvimento)
- **Imagem**: mailhog/mailhog
- **Portas**: 1025 (SMTP), 8025 (Web UI)
- **Uso**: Teste de emails em desenvolvimento

## Arquivos Criados

```
sysdesk/
├── docker-compose.yml           # Configuração principal
├── docker-compose_T0.002.yml    # Cópia com sufixo
├── docker-compose.override.yml  # Overrides para desenvolvimento
├── .env                         # Variáveis de ambiente
│
├── ops/
│   └── nginx/
│       ├── nginx.conf           # Configuração principal NGINX
│       ├── nginx.conf_T0.002    # Cópia com sufixo
│       └── conf.d/
│           ├── default.conf     # Configuração do servidor
│           └── default.conf_T0.002
│
├── backend/
│   ├── Dockerfile               # Multi-stage build
│   └── Dockerfile_T0.002        # Cópia com sufixo
│
└── frontend/
    ├── Dockerfile               # Multi-stage build
    └── Dockerfile_T0.002        # Cópia com sufixo
```

## Networks e Volumes

### Network
- **sysdesk-network**: Bridge network com subnet 172.28.0.0/16

### Volumes
- **db_data**: Dados persistentes do MariaDB
- **redis_data**: Dados persistentes do Redis
- **nginx_cache**: Cache do NGINX

## Comandos Úteis

```bash
# Build de todos os serviços
pnpm docker:build

# Iniciar todos os serviços
pnpm docker:up

# Parar todos os serviços
pnpm docker:down

# Ver logs
pnpm docker:logs

# Status dos serviços
pnpm docker:ps

# Limpar tudo (incluindo volumes)
pnpm docker:clean

# Rebuild completo
pnpm docker:rebuild
```

## Desenvolvimento vs Produção

### Desenvolvimento (docker-compose.override.yml)
- Hot reload habilitado
- Volumes montados para código fonte
- Portas expostas para debug
- Mailhog para testes de email
- Build target: development

### Produção
- Builds otimizados e minificados
- Usuários não-root
- Sem volumes de código fonte
- Build target: production
- Healthchecks rigorosos

## Healthchecks

Todos os serviços possuem healthchecks configurados:

| Serviço | Endpoint/Comando | Intervalo | Timeout |
|---------|------------------|-----------|---------|
| MariaDB | healthcheck.sh | 10s | 5s |
| Redis | redis-cli ping | 10s | 5s |
| Backend | curl /health | 30s | 10s |
| Frontend | curl / | 30s | 10s |
| NGINX | wget /health | 30s | 10s |

## Segurança

### Headers HTTP (NGINX)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Rate Limiting
- API: 10 requests/second
- Frontend: 30 requests/second

### Usuários não-root
- Backend: usuário `nestjs` (UID 1001)
- Frontend: usuário `nextjs` (UID 1001)

## Validação

✅ docker-compose.yml criado e configurado
✅ NGINX configurado como reverse proxy
✅ Dockerfiles multi-stage para frontend e backend
✅ Healthchecks implementados
✅ Volumes persistentes configurados
✅ Networks isoladas
✅ Scripts de gerenciamento adicionados
✅ Ambiente de desenvolvimento configurado
