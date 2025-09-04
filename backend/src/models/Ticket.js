const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticket_number: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    comment: 'Número único do chat para referência fácil'
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    },
    comment: 'Empresa cliente do ERP'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que iniciou o chat'
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Agente de suporte atendendo'
  },
  status: {
    type: DataTypes.ENUM('waiting', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'waiting',
    comment: 'Status atual da conversa'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
    defaultValue: 'normal',
    comment: 'Prioridade do atendimento'
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Assunto/resumo da conversa'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Categoria do problema (ex: fiscal, estoque, vendas)'
  },
  first_response_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Quando o suporte respondeu pela primeira vez'
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Quando o problema foi resolvido'
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Quando a conversa foi encerrada'
  },
  satisfaction_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Avaliação do atendimento (1-5 estrelas)'
  },
  satisfaction_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comentário sobre o atendimento'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados adicionais (navegador, SO, módulo do ERP, etc)'
  },
  is_from_erp: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se foi iniciado de dentro do ERP'
  },
  erp_module: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Módulo do ERP relacionado'
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ticket_number']
    },
    {
      fields: ['client_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['assigned_to']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: async (ticket) => {
      // Gerar número do ticket automaticamente
      if (!ticket.ticket_number) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Contar tickets do dia para gerar sequência
        const count = await Ticket.count({
          where: sequelize.where(
            sequelize.fn('DATE', sequelize.col('created_at')),
            sequelize.fn('CURDATE')
          )
        });
        
        const sequence = String(count + 1).padStart(4, '0');
        ticket.ticket_number = `${year}${month}${day}-${sequence}`;
      }
    }
  }
});

// Métodos de classe
Ticket.getWaitingTickets = async function() {
  return await this.findAll({
    where: { status: 'waiting' },
    order: [
      ['priority', 'DESC'],
      ['created_at', 'ASC']
    ]
  });
};

Ticket.getActiveBySupport = async function(supportId) {
  return await this.findAll({
    where: {
      assigned_to: supportId,
      status: ['waiting', 'in_progress']
    }
  });
};

Ticket.getByClient = async function(clientId, options = {}) {
  return await this.findAll({
    where: { 
      client_id: clientId,
      ...options.where 
    },
    order: [['created_at', 'DESC']],
    ...options
  });
};

module.exports = Ticket;
