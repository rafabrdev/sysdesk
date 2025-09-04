const { sequelize } = require('../config/database');
const Client = require('./Client');
const User = require('./User');
const Session = require('./Session');
const Ticket = require('./Ticket');
const Message = require('./Message');

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

// Client -> Tickets (1:N)
Client.hasMany(Ticket, {
  foreignKey: 'client_id',
  as: 'tickets'
});

Ticket.belongsTo(Client, {
  foreignKey: 'client_id',
  as: 'client'
});

// User -> Tickets Created (1:N)
User.hasMany(Ticket, {
  foreignKey: 'user_id',
  as: 'ticketsCreated'
});

Ticket.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'creator'
});

// User -> Tickets Assigned (1:N)
User.hasMany(Ticket, {
  foreignKey: 'assigned_to',
  as: 'ticketsAssigned'
});

Ticket.belongsTo(User, {
  foreignKey: 'assigned_to',
  as: 'assignee'
});

// Ticket -> Messages (1:N)
Ticket.hasMany(Message, {
  foreignKey: 'ticket_id',
  as: 'messages'
});

Message.belongsTo(Ticket, {
  foreignKey: 'ticket_id',
  as: 'ticket'
});

// User -> Messages (1:N)
User.hasMany(Message, {
  foreignKey: 'user_id',
  as: 'messages'
});

Message.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'sender'
});

// Testar conexão com o banco
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
};

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
  Ticket,
  Message,
  testConnection,
  syncDatabase
};
