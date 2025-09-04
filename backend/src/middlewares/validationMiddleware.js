const Joi = require('joi');
const { logger } = require('../config/database');

/**
 * Validation schemas for authentication
 */
const authSchemas = {
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
      })
  }),

  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      }),
    name: Joi.string()
      .min(2)
      .max(255)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 255 characters',
        'any.required': 'Name is required'
      }),
    role: Joi.string()
      .valid('client', 'support', 'admin')
      .optional()
      .default('client'),
    client_id: Joi.string()
      .uuid()
      .when('role', {
        is: 'client',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
  }),

  registerOrganization: Joi.object({
    // User data
    user: Joi.object({
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(6)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required(),
      name: Joi.string()
        .min(2)
        .max(255)
        .required()
    }).required(),
    
    // Organization data
    organization: Joi.object({
      name: Joi.string()
        .min(2)
        .max(255)
        .required(),
      email: Joi.string()
        .email()
        .required(),
      cnpj: Joi.string()
        .pattern(/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2}$/)
        .optional(),
      phone: Joi.string()
        .optional(),
      address: Joi.string()
        .max(500)
        .optional(),
      city: Joi.string()
        .max(100)
        .optional(),
      state: Joi.string()
        .length(2)
        .optional(),
      zip_code: Joi.string()
        .pattern(/^[0-9]{5}-?[0-9]{3}$/)
        .optional(),
      subscription_type: Joi.string()
        .valid('free', 'basic', 'pro', 'enterprise')
        .default('free')
    }).required()
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'New password must be at least 6 characters',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      })
  }),

  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
      })
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required'
      }),
    newPassword: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required'
      })
  })
};

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn(`Validation error on ${req.method} ${req.originalUrl}:`, errors);

      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid request data',
        errors
      });
    }

    // Replace request property with validated and sanitized value
    req[property] = value;
    next();
  };
};

/**
 * Validate MongoDB ObjectId
 */
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !Joi.string().uuid().validate(id).error === undefined) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateId,
  authSchemas
};
