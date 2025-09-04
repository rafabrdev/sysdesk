const authService = require('../services/authService');
const { User } = require('../models');
const { logger } = require('../config/database');

/**
 * Middleware to authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    // Check Bearer format
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    try {
      // Verify token and session
      const decoded = await authService.verifySession(token);
      
      // Get fresh user data
      const user = await User.findOne({
        where: { 
          id: decoded.id,
          is_active: true
        },
        attributes: {
          exclude: ['password', 'password_reset_token', 'refresh_token']
        },
        include: [{
          model: require('../models/Client'),
          as: 'client',
          attributes: ['id', 'name', 'subscription_type', 'is_active']
        }]
      });

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found or inactive'
        });
      }

      // Check if client is active (for non-master users)
      if (user.role !== 'master' && user.client && !user.client.is_active) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Your organization account is inactive'
        });
      }

      // Attach user and token to request
      req.user = user.toJSON();
      req.token = token;
      req.decoded = decoded;
      
      next();
    } catch (error) {
      logger.warn(`Authentication failed: ${error.message}`);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'TokenExpired',
          message: 'Authentication token has expired'
        });
      }
      
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    logger.error(`Authentication middleware error: ${error.message}`);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Authentication service unavailable'
    });
  }
};

/**
 * Middleware to authorize based on roles (RBAC)
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // First ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Master role can access everything
    if (req.user.role === 'master') {
      return next();
    }

    // Check if user's role is in allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.email} with role ${req.user.role} to ${req.method} ${req.originalUrl}`);
      
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to check resource ownership
 * For client role users to access only their own resources
 */
const authorizeOwner = (resourceField = 'user_id') => {
  return (req, res, next) => {
    // First ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Master and admin can access everything
    if (['master', 'admin'].includes(req.user.role)) {
      return next();
    }

    // Check ownership for params ID
    const resourceId = req.params.id || req.params.userId || req.params[resourceField];
    
    if (resourceId && resourceId !== req.user.id) {
      // Support agents can access tickets from their assigned clients
      if (req.user.role === 'support') {
        // This would require checking if the resource belongs to an assigned client
        // For now, we'll allow support to proceed (implement detailed check later)
        return next();
      }

      logger.warn(`Ownership denied for user ${req.user.email} accessing resource ${resourceId}`);
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

/**
 * Middleware to check client membership
 * Ensures users can only access resources within their client organization
 */
const authorizeClientAccess = (clientIdField = 'client_id') => {
  return (req, res, next) => {
    // First ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Master can access everything
    if (req.user.role === 'master') {
      return next();
    }

    // Get client ID from request (params, body, or query)
    const clientId = req.params[clientIdField] || 
                    req.body[clientIdField] || 
                    req.query[clientIdField];

    // If client ID is specified and doesn't match user's client
    if (clientId && clientId !== req.user.client_id) {
      logger.warn(`Client access denied for user ${req.user.email} to client ${clientId}`);
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access resources within your organization'
      });
    }

    // For POST/PUT requests, ensure client_id in body matches user's client
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      req.body[clientIdField] = req.user.client_id;
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Continues even if no token is provided, but attaches user if token is valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];

    try {
      const decoded = await authService.verifySession(token);
      
      const user = await User.findOne({
        where: { 
          id: decoded.id,
          is_active: true
        },
        attributes: {
          exclude: ['password', 'password_reset_token', 'refresh_token']
        }
      });

      if (user) {
        req.user = user.toJSON();
        req.token = token;
        req.decoded = decoded;
      }
    } catch (error) {
      // Silent fail - continue without authentication
      logger.debug(`Optional auth failed: ${error.message}`);
    }

    next();
  } catch (error) {
    logger.error(`Optional auth middleware error: ${error.message}`);
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  authorizeOwner,
  authorizeClientAccess,
  optionalAuth
};
