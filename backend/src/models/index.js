const { sequelize } = require('../config/database');
const Client = require('./Client');
const User = require('./User');
const Session = require('./Session');

// Definir relacionamentos

// Client -> Users (1:N)
Client.hasMany(User, {
  foreignKey: 'client_id',
  as: 'users'
});

User.belongsTo(Client, {
  foreignKey: 'client_id',
  as: 'client'
});

// User -> Sessions (1:N)
User.hasMany(Session, {
  foreignKey: 'user_id',
  as: 'sessions'
});

Session.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Session -> User (revoked_by)
Session.belongsTo(User, {
  foreignKey: 'revoked_by',
  as: 'revokedBy'
});

// Sincronizar modelos com o banco
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: false });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Client,
  User,
  Session,
  syncDatabase
};
