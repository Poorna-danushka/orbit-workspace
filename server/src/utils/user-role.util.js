const AppError = require('./AppError');
const ErrorCodes = require('./error-codes');

const isSupportedUserRole = (role) => role === 'admin' || role === 'user';

const assertSupportedUserRole = (role) => {
  if (!isSupportedUserRole(role)) {
    throw AppError.forbidden(ErrorCodes.FORBIDDEN, 'Account role is not authorized');
  }
};

module.exports = { assertSupportedUserRole };
