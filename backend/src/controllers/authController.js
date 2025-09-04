const authService = require('../services/authService');
const { User } = require('../models');
const { logger } = require('../config/database');
const crypto = require('crypto');

/**
 * User login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login(email, password, ipAddress, userAgent);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    logger.error('Login error:', error);
    
    if (error.message.includes('Invalid credentials') || 
        error.message.includes('locked')) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred during login'
    });
  }
};

/**
 * User registration
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const userData = {
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      role: req.body.role || 'client',
      client_id: req.body.client_id
    };

    const user = await authService.register(userData);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user }
    });
  } catch (error) {
    logger.error('Registration error:', error);

    if (error.message.includes('already')) {
      return res.status(409).json({
        error: 'ConflictError',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred during registration'
    });
  }
};

/**
 * Organization registration (creates client + admin user)
 * POST /api/auth/register-organization
 */
const registerOrganization = async (req, res) => {
  try {
    const { user: userData, organization: orgData } = req.body;
    
    // Set user role to admin for organization creator
    userData.role = 'admin';

    const user = await authService.register(userData, orgData);

    res.status(201).json({
      success: true,
      message: 'Organization registration successful',
      data: { user }
    });
  } catch (error) {
    logger.error('Organization registration error:', error);

    if (error.message.includes('already')) {
      return res.status(409).json({
        error: 'ConflictError',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred during organization registration'
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.refreshAccessToken(
      refreshToken, 
      ipAddress, 
      userAgent
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Token refresh error:', error);

    if (error.message.includes('Invalid') || 
        error.message.includes('expired')) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred during token refresh'
    });
  }
};

/**
 * User logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.token;

    const result = await authService.logout(userId, token);

    res.json({
      success: true,
      message: 'Logout successful',
      data: { sessionsRevoked: result }
    });
  } catch (error) {
    logger.error('Logout error:', error);

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred during logout'
    });
  }
};

/**
 * Logout all sessions
 * POST /api/auth/logout-all
 */
const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await authService.logoutAllSessions(userId);

    res.json({
      success: true,
      message: 'All sessions logged out successfully',
      data: { sessionsRevoked: count }
    });
  } catch (error) {
    logger.error('Logout all error:', error);

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred during logout'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
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
      return res.status(404).json({
        error: 'NotFound',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get current user error:', error);

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred while fetching user data'
    });
  }
};

/**
 * Update current user profile
 * PUT /api/auth/me
 */
const updateCurrentUser = async (req, res) => {
  try {
    const allowedFields = ['name', 'avatar_url', 'metadata'];
    const updateData = {};

    // Filter only allowed fields
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    await User.update(updateData, {
      where: { id: req.user.id }
    });

    const updatedUser = await User.findOne({
      where: { id: req.user.id },
      attributes: {
        exclude: ['password', 'password_reset_token', 'refresh_token']
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    logger.error('Update profile error:', error);

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred while updating profile'
    });
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by model hook)
    user.password = newPassword;
    await user.save();

    // Logout all sessions for security
    await authService.logoutAllSessions(user.id);

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    logger.error('Change password error:', error);

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred while changing password'
    });
  }
};

/**
 * Verify session/token
 * GET /api/auth/verify
 */
const verifySession = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Session is valid',
      data: {
        user: req.user,
        expiresIn: req.decoded.exp - Math.floor(Date.now() / 1000)
      }
    });
  } catch (error) {
    logger.error('Verify session error:', error);

    res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred while verifying session'
    });
  }
};

module.exports = {
  login,
  register,
  registerOrganization,
  refreshToken,
  logout,
  logoutAll,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  verifySession
};
