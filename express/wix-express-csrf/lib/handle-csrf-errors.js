const {wixSystemError, ErrorCode, HttpStatus} = require('wix-errors');

module.exports = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    next(new CsrfAuthenticationError(err));
  } else {
    next(err);
  }
};

class CsrfAuthenticationError extends wixSystemError(ErrorCode.BAD_CSRF_TOKEN, HttpStatus.FORBIDDEN) {
  constructor(error) {
    super('csrf authentication failed', error);
  }
}
