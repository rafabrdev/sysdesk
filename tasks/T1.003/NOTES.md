# T1.003 - Invite-only Registration + RBAC Guards

## Objetivo
Implementar registro de usuários apenas por convite e guards de autorização baseados em papéis (RBAC).

## Tarefas
- [x] Criar estrutura de tracking
- [ ] Implementar módulo de usuários com registro por convite
- [ ] Implementar módulo de convites
- [ ] Criar guards RBAC (roles.guard)
- [ ] Criar decorator @Roles()
- [ ] Criar DTOs de registro e convite
- [ ] Testar fluxo completo
- [ ] Documentar no README

## Requisitos (project-manual.xml)
- Apenas tokens de convite válidos permitem registro
- Rotas protegidas por @Roles decorator
- Convites têm expiração e podem ser single ou multi-uso
- Papéis: MASTER_ADMIN, ADMIN, OPERATOR, CLIENT

## Arquivos a criar
- /backend/src/modules/users/users.module_T1.003.ts
- /backend/src/modules/users/users.controller_T1.003.ts
- /backend/src/modules/users/users.service_T1.003.ts
- /backend/src/modules/invites/invites.module_T1.003.ts
- /backend/src/modules/invites/invites.controller_T1.003.ts
- /backend/src/modules/invites/invites.service_T1.003.ts
- /backend/src/guards/roles.guard_T1.003.ts
- /backend/src/decorators/roles.decorator_T1.003.ts
- /backend/src/modules/users/dto/*.dto_T1.003.ts
- /backend/src/modules/invites/dto/*.dto_T1.003.ts

## Endpoints a implementar
- POST /api/auth/register-by-invite
- POST /api/invites (criar convite - ADMIN+)
- GET /api/invites (listar convites - ADMIN+)
- GET /api/invites/:token (validar token público)
- DELETE /api/invites/:id (cancelar convite - ADMIN+)
- GET /api/users (listar usuários - ADMIN+)
- PATCH /api/users/:id (atualizar usuário - ADMIN+)

## Notas de Implementação
- Usar transações do Prisma para registro + invalidação de convite
- Validar role do convidador >= role do convidado
- Audit log para todas operações de convite/registro
- Convites devem ter campo `maxUses` e `uses`
- Enviar email ao criar convite (preparar estrutura, implementação futura)
