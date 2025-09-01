# Task T0.003 - Prisma Schema + Seed

## Objetivo
Criar schema completo do banco de dados com migrations e seed inicial para desenvolvimento.

## Status
🟨 **Em progresso**

## Notas de Implementação

### Iniciado em: 2025-09-01 15:42 UTC

1. **Branch criada**: `sprint/S0_task_T0.003-prisma-seed`
2. **Diretório de task criado**: `/tasks/T0.003/`

### Tabelas a criar/expandir:
- [x] companies (já existe base)
- [x] users (já existe base)
- [ ] invites (convites para registro)
- [ ] sessions (refresh tokens)
- [ ] audit_logs (LGPD compliance)

### Dados de seed:
- [ ] Empresa BR SISTEMAS
- [ ] Usuário Master Admin
- [ ] Empresa de teste
- [ ] Usuários de teste (diferentes roles)

### Próximos passos:
- [ ] Expandir schema.prisma
- [ ] Criar script de seed
- [ ] Gerar migrations
- [ ] Executar seed
- [ ] Validar dados no banco
- [ ] Commit e push

## Schema Overview

```
companies (1) ----< (N) users
    |                     |
    |                     |
    v                     v
invites (N)          sessions (N)
                          |
                          v
                    audit_logs (N)
```
