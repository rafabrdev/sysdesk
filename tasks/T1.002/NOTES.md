# T1.002 - Implementar Backend Auth (JWT + Refresh Tokens + bcrypt)

## 📋 Objetivo
Implementar sistema completo de autenticação no backend NestJS com JWT, refresh tokens e hash seguro de senhas usando bcrypt.

## 🔧 Componentes a Implementar

### 1. Auth Module
- AuthController: Endpoints de autenticação
- AuthService: Lógica de autenticação
- Strategies: JWT e Refresh Token
- DTOs: Login, Register, Token Response

### 2. Endpoints
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Invalidar refresh token
- `GET /api/auth/me` - Dados do usuário autenticado

### 3. JWT Strategy
- Validação de access token
- Extração de payload
- Proteção de rotas

### 4. Refresh Strategy
- Validação de refresh token
- Rotação de tokens
- Revogação segura

### 5. Security Features
- bcrypt com salt rounds configurável
- Token expiration configurável
- Rate limiting em login
- Account lockout após falhas
- Session tracking

## 🔒 Requisitos de Segurança
- Passwords hasheados com bcrypt (min 12 rounds)
- JWT com secret forte
- Refresh tokens únicos por sessão
- HttpOnly cookies em produção
- CORS configurado
- Rate limiting

## 📦 Dependências
- @nestjs/jwt
- @nestjs/passport
- passport
- passport-jwt
- bcrypt
- @types/passport-jwt
- @types/bcrypt

## 🔄 Fluxo de Autenticação
1. Cliente envia email/senha para /login
2. Backend valida credenciais
3. Gera access token (15min) e refresh token (7d)
4. Salva refresh token na tabela sessions
5. Retorna tokens para cliente
6. Cliente usa access token em headers
7. Quando expirar, usa refresh token para renovar
8. Logout invalida refresh token
