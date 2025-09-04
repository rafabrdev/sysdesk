const { Sequelize } = require('sequelize');
const winston = require('winston');

// Configurar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Configuração do Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sysdesk',
  process.env.DB_USER || 'sysdesk_user',
  process.env.DB_PASSWORD || 'SysDesk@2025!Secure',
  {
    host: process.env.DB_HOST || 'mariadb',
    port: process.env.DB_PORT || 3306,
    dialect: 'mariadb',
    logging: process.env.NODE_ENV === 'development' ? 
      (msg) => logger.debug(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    dialectOptions: {
      timezone: process.env.SYSTEM_TIMEZONE || 'America/Sao_Paulo',
      dateStrings: true,
      typeCast: true
    },
    timezone: process.env.SYSTEM_TIMEZONE || 'America/Sao_Paulo'
  }
);

// Testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  logger
};
