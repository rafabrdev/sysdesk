const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Client, Session } = require('../models');
const { logger } = require('../config/database');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2025';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production-2025';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'sysdesk',
      audience: 'sysdesk-api'
    });
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      issuer: 'sysdesk',
      audience: 'sysdesk-api'
    });
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET, {
        issuer: 'sysdesk',
        audience: 'sysdesk-api'
      });
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'sysdesk',
        audience: 'sysdesk-api'
      });
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  /**
   * Login user and generate tokens
   */
  async login(email, password, ipAddress, userAgent) {
    try {
      // Find user with client
      const user = await User.findOne({
        where: { email: email.toLowerCase(), is_active: true },
        include: [{
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'subscription_type', 'is_active']
        }]
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.locked_until && user.locked_until > new Date()) {
        throw new Error('Account is temporarily locked due to multiple failed login attempts');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        // Increment failed login attempts
        user.failed_login_attempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.failed_login_attempts >= 5) {
          user.locked_until = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        }
        
        await user.save();
        throw new Error('Invalid credentials');
      }

      // Check if client is active (for non-master users)
      if (user.role !== 'master' && user.client && !user.client.is_active) {
        throw new Error('Your organization account is inactive');
      }

      // Reset failed login attempts
      user.failed_login_attempts = 0;
      user.locked_until = null;
      user.last_seen = new Date();
      user.is_online = true;
      await user.save();

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        client_id: user.client_id,
        client_name: user.client?.name
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken({ id: user.id });

      // Calculate expiration times
      const accessExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Create session
      await Session.create({
        user_id: user.id,
        token: crypto.createHash('sha256').update(accessToken).digest('hex'),
        refresh_token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: accessExpiresAt,
        refresh_expires_at: refreshExpiresAt
      });

      logger.info(`User ${user.email} logged in successfully from IP ${ipAddress}`);

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken,
        expiresIn: 3600 // seconds
      };
    } catch (error) {
      logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData, clientData = null) {
    try {
      // Check if email already exists
      const existingUser = await User.findOne({
        where: { email: userData.email.toLowerCase() }
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      let client = null;

      // Create client if provided (for new organizations)
      if (clientData && userData.role === 'admin') {
        const existingClient = await Client.findOne({
          where: { email: clientData.email.toLowerCase() }
        });

        if (existingClient) {
          throw new Error('Client organization already exists');
        }

        client = await Client.create({
          ...clientData,
          email: clientData.email.toLowerCase()
        });
      }

      // Create user
      const user = await User.create({
        ...userData,
        email: userData.email.toLowerCase(),
        client_id: client ? client.id : userData.client_id,
        role: userData.role || 'client'
      });

      // Reload user with associations
      await user.reload({
        include: [{
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'subscription_type']
        }]
      });

      logger.info(`New user registered: ${user.email} with role: ${user.role}`);

      return user.toJSON();
    } catch (error) {
      logger.error(`Registration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken, ipAddress, userAgent) {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await User.findOne({
        where: { id: decoded.id, is_active: true },
        include: [{
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'subscription_type', 'is_active']
        }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if refresh token exists in active session
      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const session = await Session.findOne({
        where: {
          user_id: user.id,
          refresh_token: hashedToken,
          is_active: true
        }
      });

      if (!session) {
        throw new Error('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (session.refresh_expires_at < new Date()) {
        session.is_active = false;
        await session.save();
        throw new Error('Refresh token expired');
      }

      // Generate new access token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        client_id: user.client_id,
        client_name: user.client?.name
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      
      // Update session
      session.token = crypto.createHash('sha256').update(accessToken).digest('hex');
      session.expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      session.last_activity = new Date();
      session.ip_address = ipAddress;
      session.user_agent = userAgent;
      await session.save();

      logger.info(`Access token refreshed for user: ${user.email}`);

      return {
        accessToken,
        expiresIn: 3600 // seconds
      };
    } catch (error) {
      logger.error(`Token refresh failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(userId, token) {
    try {
      // Hash the token to match stored session
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      // Revoke session
      const result = await Session.update(
        {
          is_active: false,
          revoked_at: new Date(),
          revoke_reason: 'User logout'
        },
        {
          where: {
            user_id: userId,
            token: hashedToken,
            is_active: true
          }
        }
      );

      // Update user online status
      await User.update(
        {
          is_online: false,
          last_seen: new Date()
        },
        {
          where: { id: userId }
        }
      );

      logger.info(`User ${userId} logged out`);
      
      return result[0] > 0; // Return true if at least one session was revoked
    } catch (error) {
      logger.error(`Logout failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify user session
   */
  async verifySession(token) {
    try {
      // Verify token signature
      const decoded = this.verifyAccessToken(token);
      
      // Hash token to match stored session
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      // Find active session
      const session = await Session.findOne({
        where: {
          user_id: decoded.id,
          token: hashedToken,
          is_active: true,
          expires_at: {
            [require('sequelize').Op.gt]: new Date()
          }
        }
      });

      if (!session) {
        throw new Error('Session not found or expired');
      }

      // Update last activity
      session.last_activity = new Date();
      await session.save();

      return decoded;
    } catch (error) {
      throw new Error(`Session verification failed: ${error.message}`);
    }
  }

  /**
   * Logout all user sessions
   */
  async logoutAllSessions(userId) {
    try {
      const result = await Session.revokeUserSessions(userId, userId, 'Logout all sessions');
      
      await User.update(
        {
          is_online: false,
          last_seen: new Date()
        },
        {
          where: { id: userId }
        }
      );

      logger.info(`All sessions revoked for user ${userId}`);
      
      return result[0]; // Return number of revoked sessions
    } catch (error) {
      logger.error(`Logout all sessions failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AuthService();
