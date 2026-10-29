const { validationResult } = require('express-validator');
const AppError = require('./AppError');
const ErrorCodes = require('./error-codes');

/**
 * Middleware factory for express-validator error handling
 * Transforms validation errors to match the standard error contract
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Transform express-validator errors to match our contract
    const validationErrors = errors.array().map((err) => ({
      field: err.path || err.param || 'unknown',
      message: err.msg || 'Invalid value',
      msg: err.msg || 'Invalid value', // Keep for frontend compatibility (temporary)
    }));

    return next(AppError.validation(ErrorCodes.VALIDATION_ERROR, 'Validation failed', validationErrors));
  };
};

module.exports = { validate };
