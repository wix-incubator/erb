const {ErrorCode, HttpStatus, wixSystemError} = require('wix-errors');

class SessionExpiredError extends wixSystemError(ErrorCode.INVALID_SESSION, HttpStatus.UNAUTHORIZED) {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class SessionMalformedError extends wixSystemError(ErrorCode.INVALID_SESSION, HttpStatus.UNAUTHORIZED) {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports.SessionExpiredError = SessionExpiredError;
module.exports.SessionMalformedError = SessionMalformedError;
