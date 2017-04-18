const {wixSystemError, wixBusinessError, HttpStatus} = require('wix-errors');

class DecryptError extends wixSystemError(-500, HttpStatus.INTERNAL_SERVER_ERROR) {
  constructor(cause) {
    super('BO cookie decryption has failed', cause);
  }
}

class UnauthorizedError extends wixBusinessError(-400, HttpStatus.UNAUTHORIZED) {
  constructor() {
    super('BO auth cookie is missing');
  }
}

module.exports = {DecryptError, UnauthorizedError};
