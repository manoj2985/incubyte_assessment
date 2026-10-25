const jwt = require('jsonwebtoken');
const { AppError } = require('../errors/app-error');

function authenticate(jwtSecret) {
  return (req, _res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Please log in to continue.'));
    }

    try {
      req.user = jwt.verify(token, jwtSecret);
      return next();
    } catch (_error) {
      return next(new AppError(401, 'INVALID_TOKEN', 'Your session is invalid or has expired.'));
    }
  };
}

function requireAdmin(req, _res, next) {
  if (req.user.role !== 'ADMIN') {
    return next(new AppError(403, 'ADMIN_REQUIRED', 'Administrator access is required.'));
  }
  return next();
}

module.exports = { authenticate, requireAdmin };

