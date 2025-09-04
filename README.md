# SysDesk v1.0

🎫 Sistema de Help Desk / Tickets para gestão de atendimento com chat em tempo real.

## 📋 Visão Geral

O SysDesk é uma plataforma completa de suporte técnico que permite gerenciamento de tickets, chat em tempo real, upload de arquivos e controle de acesso baseado em papéis (RBAC).

## 🚀 Stack Tecnológica

### Backend
- **Node.js** + **Express** - Servidor web robusto e escalável
- **Socket.IO** - Comunicação em tempo real para chat
- **JWT** - Autenticação segura e stateless
- **Sequelize** - ORM para MariaDB
- **bcrypt** - Criptografia de senhas

### Frontend  
- **React** + **TypeScript** + **Vite** - Interface moderna e reativa
- **shadcn/ui** - Componentes UI estilo ChatGPT
- **TailwindCSS** - Estilização utility-first
- **React Router** - Roteamento SPA
- **Socket.IO Client** - Chat em tempo real

### Banco de Dados
- **MariaDB** - Banco relacional robusto
- **Sequelize** - Migrações e Models

### DevOps
- **Docker** + **Docker Compose** - Containerização
- **GitHub Actions** - CI/CD (futuro)

## 🔐 RBAC - Controle de Acesso

| Role | Permissões |
|------|------------|
| **client** | Criar tickets, visualizar próprios chats |
| **support** | Atender tickets, gerenciar conversas |
| **admin** | Gerenciar usuários e tickets |
| **master** | Acesso total ao sistema |

## 📂 Estrutura do Projeto

```
sysdesk/
├── backend/          # API Node.js + Express
│   ├── src/         
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── config/
│   ├── Dockerfile.dev
│   └── package.json
│
├── frontend/         # App React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│   ├── Dockerfile.dev
│   └── package.json
│
├── database/         # Scripts SQL e migrações
│   └── init.sql
│
├── docs/            # Documentação
├── docker-compose.yml
└── .env.example
```

## 🛠️ Instalação e Execução

### Pré-requisitos
- Docker Desktop instalado
- Git

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/BR-SISTEMAS/sysdesk.git
cd sysdesk
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Acesse o sistema:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Socket.IO: http://localhost:5000/socket.io

## 📈 Roadmap - Sprints

- [x] Sprint 1: Setup inicial e Docker
- [ ] Sprint 2: Autenticação JWT e RBAC
- [ ] Sprint 3: Frontend básico e Dashboard
- [ ] Sprint 4: Chat em tempo real
- [ ] Sprint 5: Upload de arquivos
- [ ] Sprint 6: Painel administrativo
- [ ] Sprint 7: Testes e deploy

## 👥 Equipe

**BR Sistemas** - Desenvolvimento e Manutenção

## 📄 Licença

Proprietary - BR Sistemas © 2025. Todos os direitos reservados.
