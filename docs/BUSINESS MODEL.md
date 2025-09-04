# 📋 Escopo Real do Projeto SysDesk

## Contexto do Negócio

A **BR Sistemas** oferece um **ERP como serviço principal**. O SysDesk é um **sistema de suporte complementar gratuito** para atender os clientes que já utilizam o ERP.

## O que o Sistema É

### ✅ Sistema de Chat de Suporte em Tempo Real
- **Objetivo Principal**: Permitir que clientes do ERP conversem com a equipe de suporte da BR Sistemas
- **Sem cobrança**: É um serviço incluído para clientes do ERP
- **Foco**: Comunicação instantânea e resolução rápida de dúvidas

### ✅ Tickets como Identificadores de Conversa
- Tickets **NÃO são o foco principal**
- São apenas **IDs únicos** para cada conversa/sessão de chat
- Criados **automaticamente** quando cliente inicia uma conversa
- Servem para **organizar o histórico** de conversas

## Estrutura Simplificada

### 1. Modelo de Negócio

```
BR Sistemas (Master/Admin)
    ↓
Empresas Clientes (que usam o ERP)
    ↓
Usuários das Empresas (que precisam de suporte)
```

### 2. Fluxo Principal

1. **Cliente do ERP faz login** no sistema de suporte
2. **Inicia um chat** (automaticamente cria um "ticket" como ID)
3. **Agente de suporte** recebe notificação
4. **Conversa em tempo real** até resolver a dúvida
5. **Chat é encerrado** (ticket marcado como resolvido)

### 3. Roles Simplificados

#### Master (BR Sistemas - Proprietário)
- Acesso total ao sistema
- Gerencia toda a plataforma
- Cria/remove empresas clientes
- Visualiza todas as conversas

#### Admin (BR Sistemas - Gerentes)
- Gerencia agentes de suporte
- Supervisiona atendimentos
- Acessa relatórios
- Intervém em conversas quando necessário

#### Support (BR Sistemas - Atendentes)
- Atende chats dos clientes
- Responde dúvidas sobre o ERP
- Encaminha casos complexos

#### Client (Usuários do ERP)
- Inicia conversas de suporte
- Envia mensagens e arquivos
- Visualiza histórico próprio

## Ajustes no Modelo de Dados

### Tabela `clients` (Empresas)
- Representa empresas que usam o ERP
- Campos relevantes:
  - `name`: Nome da empresa
  - `cnpj`: CNPJ da empresa
  - `is_active`: Se ainda é cliente do ERP
  - ~~`subscription_type`~~ → **REMOVER** (não há assinatura no suporte)
  - ~~`subscription_expires_at`~~ → **REMOVER**
  - ~~`max_users`~~ → **OPCIONAL** (limite técnico se necessário)
  - ~~`max_tickets`~~ → **REMOVER** (sem limite de conversas)

### Tabela `tickets` 
- Renomear mentalmente para **"conversations"** ou **"chats"**
- Representa uma sessão de conversa
- Campos principais:
  - `id`: Identificador único da conversa
  - `client_id`: Empresa do cliente
  - `user_id`: Usuário que iniciou
  - `support_id`: Agente atendendo
  - `status`: open, in_progress, closed
  - `created_at`: Quando iniciou
  - `closed_at`: Quando foi resolvida

### Tabela `messages`
- Mensagens dentro de cada conversa
- Vinculadas ao `ticket_id` (conversation_id)

## Interface Simplificada

### Para Clientes
1. **Botão único**: "Iniciar Conversa"
2. **Lista simples**: Conversas anteriores
3. **Chat limpo**: Estilo WhatsApp/ChatGPT

### Para Suporte
1. **Dashboard**: Conversas aguardando
2. **Fila de atendimento**: Ordenada por tempo
3. **Chat com contexto**: Info do cliente e histórico

### Para Admin/Master
1. **Visão geral**: Todas as conversas
2. **Métricas**: Tempo de resposta, satisfação
3. **Gestão**: Usuários e empresas

## Prioridades de Desenvolvimento

### Alta Prioridade ⭐
- Chat em tempo real (Socket.IO)
- Autenticação e identificação de empresa
- Interface de chat limpa e funcional
- Notificações de novas mensagens

### Média Prioridade
- Upload de arquivos/prints
- Histórico de conversas
- Busca em conversas antigas

### Baixa Prioridade
- Relatórios e métricas
- Exportação de conversas
- Integração com o ERP

## Simplificações Importantes

1. **Sem sistema de cobrança/pagamento**
2. **Sem limites de uso baseados em plano**
3. **Sem marketplace ou múltiplos produtos**
4. **Tickets são apenas organizacionais, não o produto principal**
5. **Foco em resolver dúvidas do ERP rapidamente**

## Resultado Esperado

Um sistema de chat de suporte **simples, rápido e eficiente** que:
- Conecta clientes do ERP com o suporte
- Mantém histórico organizado
- Funciona em tempo real
- É fácil de usar para ambos os lados

---

**Lembre-se**: O objetivo é **facilitar o suporte ao ERP**, não criar um sistema complexo de tickets. O chat é o coração do sistema!
