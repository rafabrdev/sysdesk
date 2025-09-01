# T1.004 - Frontend Login/Register

## Objetivo
Implementar páginas de login e registro no frontend Next.js com integração à API de autenticação.

## Tarefas
- [x] Criar estrutura de tracking
- [ ] Criar hook useAuth
- [ ] Criar página de login
- [ ] Criar página de registro por convite
- [ ] Criar contexto de autenticação
- [ ] Implementar middleware de proteção
- [ ] Testar fluxo completo
- [ ] Documentar no README

## Requisitos (project-manual.xml)
- Usuário pode registrar via link de convite e fazer login
- JWT armazenado de forma segura (localStorage temporariamente, HttpOnly cookie futuro)
- Hooks customizados para gerenciamento de estado
- Rotas protegidas com redirecionamento

## Arquivos a criar
- /frontend/src/pages/login_T1.004.tsx
- /frontend/src/pages/register_T1.004.tsx
- /frontend/src/hooks/useAuth_T1.004.ts
- /frontend/src/contexts/AuthContext_T1.004.tsx
- /frontend/src/middleware_T1.004.ts
- /frontend/src/services/api_T1.004.ts
- /frontend/src/components/auth/*_T1.004.tsx

## Stack Frontend
- Next.js 15 com App Router
- TypeScript
- Tailwind CSS
- React Hook Form (para formulários)
- Zod (validação)
- Axios (HTTP client)

## Fluxo de Autenticação
1. Login: email + senha → JWT + refresh token
2. Registro: token convite + dados → novo usuário
3. Armazenamento: localStorage (temporário) → HttpOnly cookie (futuro)
4. Renovação: refresh token automático
5. Logout: limpar tokens + invalidar sessão
