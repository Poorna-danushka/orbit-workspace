const validateMongoIdParam = (parameterName) => (req, res, next, value) => {
  if (!/^[a-f\d]{24}$/i.test(value)) {
    const AppError = require('../utils/AppError');
    const ErrorCodes = require('../utils/error-codes');
    return next(AppError.badRequest(
      ErrorCodes.INVALID_INPUT,
      `Invalid ${parameterName}`
    ));
  }
  return next();
};

module.exports = { validateMongoIdParam };
