# T1.001 - Modelar tabelas: users, companies, invites, roles

## 📋 Objetivo
Criar os modelos Prisma para o sistema de autenticação com suporte a multi-tenancy, RBAC e registro apenas por convite.

## 🗂️ Modelos a Implementar

### 1. Company (Empresa)
- Representa uma empresa/cliente no sistema multi-tenant
- Campos: id, name, cnpj, plan, isActive, createdAt, updatedAt

### 2. User (Usuário)
- Usuários do sistema vinculados a uma empresa
- Campos: id, email, password, name, role, companyId, isActive, createdAt, updatedAt
- Índice único em email

### 3. Invite (Convite)
- Convites para registro de novos usuários
- Campos: id, email, token, companyId, role, expiresAt, usedAt, usedBy, createdBy
- Token único gerado com UUID

### 4. Session (Sessão)
- Controle de refresh tokens
- Campos: id, userId, refreshToken, expiresAt, createdAt

### 5. Role (Enum)
- MASTER_ADMIN: Admin geral do sistema
- ADMIN: Admin da empresa
- OPERATOR: Operador/Atendente
- CLIENT: Cliente final

## 🔗 Relações
- Company 1:N Users
- Company 1:N Invites
- User 1:N Sessions
- User 1:N Invites (createdBy)

## 🔒 Requisitos de Segurança
- Passwords hasheados com bcrypt (nunca texto plano)
- Soft delete em Users (isActive)
- Índices para otimização de queries
- Campos de auditoria (createdAt, updatedAt)

## 📝 Validações
- Email único por usuário
- CNPJ único por empresa
- Token de convite único
- Expiração de convites após 7 dias
