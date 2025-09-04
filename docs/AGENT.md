# Escopo do Sistema de Suporte por Sprints
*Contexto para Agente de IA*

## Visão Geral do Projeto

Desenvolver um sistema de suporte completo do zero usando:
- **Backend**: Node.js + Express + Socket.IO + JWT
- **Frontend**: React + shadcn/ui (interface moderna estilo ChatGPT)
- **Banco de Dados**: MariaDB + ORM (Sequelize/TypeORM)
- **Containerização**: Docker + Docker Compose
- **Controle de Acesso**: RBAC com roles: client, support, admin, master

## Sprint 1: Planejamento e Configuração Inicial

### Repositório e Docker
- Criar repositório Git
- Configurar Docker Compose com serviços:
  - Node.js (backend)
  - React (frontend)
  - MariaDB
- Configurar `depends_on` para inicialização ordenada
- Mapear portas, volumes e variáveis de ambiente no `docker-compose.yml`

### Configuração do Node.js
- Inicializar projeto Node (`npm init`)
- Instalar dependências:
  - Express, CORS, JWT, bcrypt
  - ORM (Sequelize ou TypeORM)
  - Socket.IO
- Criar Dockerfile para Node.js
- Configurar conexão com MariaDB usando conector oficial

### Configuração do React
- Criar projeto React (Create React App ou Vite)
- **Instalar e configurar shadcn/ui**
- Criar Dockerfile para React
- Configurar serviço no Docker Compose em modo desenvolvimento

### Estrutura de Banco de Dados
- Definir esquema inicial no MariaDB:
  - **Clients** (empresas atendidas)
  - **Users** (id, name, email, password, role, client_id)
  - **Tickets** (controle de atendimentos)
  - **Messages** (mensagens do chat)
- Implementar RBAC com campo `role` no usuário
- Criar scripts SQL ou migrações via ORM

## Sprint 2: Autenticação, Autorização e Modelos de Dados

### Autenticação JWT
- Desenvolver rotas REST para registro e login
- Gerar JWT criptografado com informações essenciais (ID, role, client_id)
- Implementar refresh tokens (opcional)

### Validação de Rotas e RBAC
- Criar middlewares de verificação JWT
- Implementar lógica RBAC:
  - **client**: criar tickets, ver próprios chats
  - **support**: aceitar tickets atribuídos
  - **admin**: gerenciar usuários e tickets
  - **master**: todos os privilégios (incluir criar admins)

### Modelos no ORM
- Definir modelos/schemas para todas as tabelas
- Configurar relações:
  - Client tem muitos Users
  - Ticket referencia User criador
  - Ticket tem muitas Messages

### Testes Iniciais
- Validar conexão ao banco
- Testar endpoints via Postman/Insomnia
- Confirmar comunicação entre serviços Docker

## Sprint 3: Front-end Básico (Login e Dashboard)

### Tela de Login
- Criar página de login com shadcn/ui components
- Implementar autenticação e armazenamento de JWT
- Redirecionamento pós-login

### Identificação por Role
- Guardar role e client_id do JWT
- Renderização condicional baseada em permissões

### Dashboard Principal
- Página inicial listando tickets abertos
- Exibir informações do usuário logado

### Estilização Base com shadcn/ui
- Implementar layout moderno estilo ChatGPT:
  - Cabeçalho
  - Painel lateral (lista de chats/menu)
  - Área principal de mensagens
  - Inputs no rodapé
- Design responsivo para desktop e mobile
- Usar componentes shadcn/ui para consistência visual

## Sprint 4: Chat em Tempo Real e Ticketing

### Socket.IO
- Integrar Socket.IO no backend e frontend
- Autenticação de socket via JWT
- Determinar usuário e role na conexão

### Fluxo de Abertura de Chat
- Criar novo Ticket ao iniciar conversa (status "open")
- Identificador único por ticket
- Associar mensagens ao ticket

### Salas Privadas
- Criar "rooms" por ticket no Socket.IO
- Acesso restrito: cliente + support(s) designados
- Permitir agentes se juntarem a salas abertas

### Eventos de Mensagem
- Definir eventos de envio/recepção
- Armazenar mensagens no banco (tabela Messages)
- Exibição em tempo real na UI

### Marcação de Estado
- Campos de status no Ticket ("open", "in-progress", "closed")
- Fluxo de trabalho de atendimento

### Interface de Chat com shadcn/ui
- Componente de chat com histórico de mensagens
- Bolhas diferenciadas por remetente
- Campo de texto para envio
- Avatares e cores por role
- Design responsivo seguindo padrões shadcn/ui

### Ping e Presença (Opcional)
- Indicador de status online/offline

## Sprint 5: Upload de Arquivos e Anexos

### Endpoint de Upload
- Rota segura com multer no Express
- Limitação de tipos e tamanhos de arquivos

### Vinculação ao Ticket
- Associar uploads à mensagem/ticket
- Salvar metadados no DB
- Pasta persistente via bind mount Docker

### Download no Front-end
- Botão de upload no chat (shadcn/ui components)
- Pré-visualização de arquivos na conversa
- Envio via Socket.IO ou HTTP

### Gerenciamento de Arquivos
- Rotina de limpeza automática (arquivos > 30 dias)
- Job agendado para manutenção do armazenamento

### Documentação
- Local de armazenamento
- Limites e formatos permitidos

## Sprint 6: Painel de Administração e Funcionalidades Master

### Gerenciamento de Usuários
- Interface administrativa com shadcn/ui:
  - Criar usuários support/client
  - Editar perfis e roles
  - Associar clientes a empresas

### Convites a Clientes
- Cadastrar novos Clients
- Sistema de convites via email/link
- Finalização de cadastro

### Intervenção em Chats
- Admin/Master podem "escutar" qualquer sala
- Botão "Intervir" para entrar em tickets

### Painel de Tickets
- Lista de tickets com filtros:
  - Por empresa, status, suporte atribuído
- Opção de fechamento manual
- Interface com shadcn/ui (tabelas, filtros, botões)

### Regras de RBAC Avançadas
- Validação completa de permissões
- Hierarquia: Master > Admin > Support > Client

### Design do Painel
- Consistência visual com tema principal
- Componentes shadcn/ui reutilizáveis
- Dashboards e tabelas responsivas

## Sprint 7: Testes, Segurança, Polimento e Deploy

### Segurança
- Revisão de segurança JWT
- Senhas com bcrypt
- Conexões HTTPS para produção

### Testes de Integração
- Testes end-to-end para todos os roles
- Fluxos completos: criar usuário → login → chat → arquivos
- Correção de bugs de sessão/permissões

### Documentação e Scripts
- Instruções de setup com Docker Compose
- Scripts de inicialização do banco
- Arquivo `.env` de exemplo
- Documentação de endpoints

### Docker Final
- Funcionamento completo com `docker-compose up`
- Persistência de dados em volumes nomeados
- Variáveis configuráveis

### Aprimoramentos de UI com shadcn/ui
- Revisão de responsividade
- Feedback visual em botões
- Mensagens de erro consistentes
- Acessibilidade
- Tema clean e moderno

### Monitoramento (Opcional)
- Logs básicos com winston
- Registro de atividades e erros

## Resultado Final

Sistema de chat de suporte completo com:
- **Chat em tempo real** entre clientes do ERP e suporte da BR Sistemas
- **Fila de atendimento** eficiente para agentes
- **Histórico organizado** de conversas por empresa
- **Upload de arquivos** para diagnóstico de problemas
- **Painel administrativo** para supervisão
- **Interface moderna** estilo WhatsApp/ChatGPT com shadcn/ui
- **Ambiente containerizado** para fácil deployment

## Prioridades de Desenvolvimento

### 🔥 Alta Prioridade (Core do Sistema)
1. **Chat em tempo real** (Socket.IO)
2. **Autenticação e RBAC**
3. **Interface de chat** limpa e funcional
4. **Sistema de fila** para agentes
5. **Notificações** de novas conversas

### 📋 Média Prioridade
1. **Upload de arquivos/screenshots**
2. **Histórico de conversas**
3. **Painel administrativo básico**
4. **Busca em conversas**

### 📊 Baixa Prioridade
1. **Relatórios e métricas avançadas**
2. **Exportação de conversas**
3. **Integração futura com ERP**
4. **Notificações por email**

## Tecnologias Principais

- **Backend**: Node.js + Express + Socket.IO + JWT + bcrypt
- **Frontend**: React + shadcn/ui + TailwindCSS
- **Banco**: MariaDB + ORM (Sequelize/TypeORM)
- **Containerização**: Docker + Docker Compose
- **Autenticação**: JWT + RBAC
- **Tempo Real**: Socket.IO
- **Upload**: Multer + File Management

---

**Lembre-se**: O objetivo principal é **facilitar o suporte aos clientes do ERP** através de um chat eficiente e intuitivo. O sistema deve ser **simples de usar** tanto para clientes quanto para agentes de suporte.