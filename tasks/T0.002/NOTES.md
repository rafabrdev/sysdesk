# Task T0.002 - Docker Compose + NGINX + Redis + MariaDB

## Objetivo
Configurar ambiente Docker completo com todos os serviços necessários para o desenvolvimento do Sysdesk.

## Status
🟨 **Em progresso**

## Notas de Implementação

### Iniciado em: 2025-09-01 15:32 UTC

1. **Branch criada**: `sprint/S0_task_T0.002-docker-compose`
2. **Diretório de task criado**: `/tasks/T0.002/`

### Serviços a configurar:
- [ ] MariaDB (porta 3306)
- [ ] Redis (porta 6379)
- [ ] Backend NestJS (porta 3333)
- [ ] Frontend Next.js (porta 3000)
- [ ] NGINX (porta 80)

### Próximos passos:
- [ ] Criar docker-compose.yml
- [ ] Configurar NGINX reverse proxy
- [ ] Criar Dockerfiles
- [ ] Configurar healthchecks
- [ ] Testar infraestrutura completa
- [ ] Commit e push

## Arquitetura Docker

```
┌─────────────────────────────────────────┐
│           NGINX (porta 80)              │
│         Reverse Proxy / LB              │
└─────────┬───────────────┬───────────────┘
          │               │
    ┌─────▼─────┐   ┌─────▼─────┐
    │ Frontend  │   │  Backend  │
    │  (3000)   │   │  (3333)   │
    └───────────┘   └─────┬─────┘
                          │
              ┌───────────┴───────────┐
              │                       │
        ┌─────▼─────┐          ┌─────▼─────┐
        │  MariaDB  │          │   Redis   │
        │  (3306)   │          │  (6379)   │
        └───────────┘          └───────────┘
```
