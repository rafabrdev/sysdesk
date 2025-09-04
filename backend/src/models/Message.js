const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticket_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tickets',
      key: 'id'
    },
    comment: 'Conversa à qual a mensagem pertence'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que enviou a mensagem'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Conteúdo da mensagem'
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'file', 'system', 'audio'),
    defaultValue: 'text',
    comment: 'Tipo de mensagem'
  },
  is_internal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se é uma nota interna (não visível ao cliente)'
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se a mensagem foi editada'
  },
  edited_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Quando foi editada'
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Soft delete da mensagem'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Quando foi deletada'
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de anexos [{filename, url, size, mimetype}]'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Metadados adicionais (IP, dispositivo, etc)'
  },
  read_by: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array de user_ids que leram a mensagem'
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Quando foi entregue ao destinatário'
  },
  seen_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Quando foi visualizada pelo destinatário'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true,
  paranoid: false, // Usando soft delete manual
  indexes: [
    {
      fields: ['ticket_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['is_internal']
    },
    {
      fields: ['is_deleted']
    }
  ]
});

// Métodos de instância
Message.prototype.markAsRead = async function(userId) {
  if (!this.read_by) {
    this.read_by = [];
  }
  
  if (!this.read_by.includes(userId)) {
    this.read_by.push(userId);
    this.seen_at = new Date();
    await this.save();
  }
};

Message.prototype.softDelete = async function() {
  this.is_deleted = true;
  this.deleted_at = new Date();
  this.content = '[Mensagem removida]';
  await this.save();
};

// Métodos de classe
Message.getByTicket = async function(ticketId, options = {}) {
  const where = {
    ticket_id: ticketId,
    is_deleted: false
  };
  
  // Se não for suporte/admin, ocultar mensagens internas
  if (options.hideInternal) {
    where.is_internal = false;
  }
  
  return await this.findAll({
    where,
    order: [['created_at', 'ASC']],
    ...options
  });
};

Message.getLastMessageByTicket = async function(ticketId) {
  return await this.findOne({
    where: {
      ticket_id: ticketId,
      is_deleted: false,
      is_internal: false
    },
    order: [['created_at', 'DESC']]
  });
};

Message.countUnreadByUser = async function(userId) {
  const result = await this.findAll({
    attributes: [
      'ticket_id',
      [sequelize.fn('COUNT', sequelize.col('id')), 'unread_count']
    ],
    where: {
      is_deleted: false,
      [sequelize.Op.not]: {
        read_by: {
          [sequelize.Op.contains]: [userId]
        }
      }
    },
    include: [{
      model: require('./Ticket'),
      as: 'ticket',
      where: {
        [sequelize.Op.or]: [
          { user_id: userId },
          { assigned_to: userId }
        ]
      }
    }],
    group: ['ticket_id']
  });
  
  return result;
};

module.exports = Message;
