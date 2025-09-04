const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'sysdesk-api',
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);

// Future route modules will be added here
// router.use('/users', userRoutes);
// router.use('/tickets', ticketRoutes);
// router.use('/messages', messageRoutes);
// router.use('/clients', clientRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: 'The requested API endpoint does not exist',
    path: req.originalUrl
  });
});

module.exports = router;
