const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate, authSchemas } = require('../middlewares/validationMiddleware');

/**
 * Public routes
 */

// Login
router.post('/login', 
  validate(authSchemas.login),
  authController.login
);

// Register user
router.post('/register',
  validate(authSchemas.register),
  authController.register
);

// Register organization with admin user
router.post('/register-organization',
  validate(authSchemas.registerOrganization),
  authController.registerOrganization
);

// Refresh access token
router.post('/refresh',
  validate(authSchemas.refreshToken),
  authController.refreshToken
);

/**
 * Protected routes (require authentication)
 */

// Verify session
router.get('/verify',
  authenticate,
  authController.verifySession
);

// Get current user
router.get('/me',
  authenticate,
  authController.getCurrentUser
);

// Update current user
router.put('/me',
  authenticate,
  authController.updateCurrentUser
);

// Change password
router.post('/change-password',
  authenticate,
  validate(authSchemas.changePassword),
  authController.changePassword
);

// Logout current session
router.post('/logout',
  authenticate,
  authController.logout
);

// Logout all sessions
router.post('/logout-all',
  authenticate,
  authController.logoutAll
);

module.exports = router;
