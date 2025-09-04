const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  device_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  device_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  refresh_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  revoked_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  revoke_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  last_activity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['token']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Class methods
Session.cleanExpired = async function() {
  return await this.update(
    { is_active: false },
    {
      where: {
        expires_at: {
          [sequelize.Sequelize.Op.lt]: new Date()
        },
        is_active: true
      }
    }
  );
};

Session.revokeUserSessions = async function(userId, revokedBy, reason = 'User logout') {
  return await this.update(
    { 
      is_active: false,
      revoked_at: new Date(),
      revoked_by: revokedBy,
      revoke_reason: reason
    },
    {
      where: {
        user_id: userId,
        is_active: true
      }
    }
  );
};

module.exports = Session;
