const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  cnpj: {
    type: DataTypes.STRING(18),
    unique: true,
    allowNull: true,
    validate: {
      is: /^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2}$/
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[\d\s\-\(\)\+]+$/
    }
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  zip_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      is: /^[0-9]{5}-?[0-9]{3}$/
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  erp_client_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Código do cliente no ERP principal'
  },
  support_priority: {
    type: DataTypes.ENUM('normal', 'high', 'critical'),
    defaultValue: 'normal',
    comment: 'Prioridade de atendimento baseada no contrato ERP'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'clients',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['cnpj']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Client;
