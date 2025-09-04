// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Import database and routes
const { testConnection, syncDatabase } = require('./models');
const apiRoutes = require('./routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', limiter);

// Health check endpoint (outside API routes)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    service: 'sysdesk-backend'
  });
});

// API routes
app.use('/api', apiRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);
  
  // Handle authentication for socket connections
  socket.on('authenticate', async (token) => {
    try {
      const authService = require('./services/authService');
      const decoded = await authService.verifySession(token);
      
      socket.userId = decoded.id;
      socket.role = decoded.role;
      socket.clientId = decoded.client_id;
      
      // Join user to their personal room
      socket.join(`user:${decoded.id}`);
      
      // Join user to their client room if applicable
      if (decoded.client_id) {
        socket.join(`client:${decoded.client_id}`);
      }
      
      // Join role-specific rooms
      socket.join(`role:${decoded.role}`);
      
      socket.emit('authenticated', { 
        success: true, 
        user: decoded 
      });
      
      console.log(`✅ Socket authenticated for user: ${decoded.email}`);
    } catch (error) {
      socket.emit('authenticated', { 
        success: false, 
        error: 'Invalid token' 
      });
      console.log(`❌ Socket authentication failed: ${error.message}`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
  
  // Test event
  socket.on('ping', (callback) => {
    if (typeof callback === 'function') {
      callback('pong');
    } else {
      socket.emit('pong');
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: true,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will start without database features.');
    } else {
      // Sync database models (create tables if not exist)
      if (process.env.NODE_ENV !== 'production') {
        await syncDatabase(false); // false = don't drop existing tables
      }
    }

    // Start server
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';

    server.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║         SysDesk Backend Server v1.0            ║
╠════════════════════════════════════════════════╣
║  🚀 Server:     http://${HOST}:${PORT}         
║  🔌 Socket.IO:  ws://${HOST}:${PORT}           
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}
║  📅 Started:    ${new Date().toISOString()}
║  💾 Database:   ${dbConnected ? '✅ Connected' : '❌ Disconnected'}
╚════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, io, server };
