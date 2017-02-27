const {wixSystemError, ErrorCode, HttpStatus} = require('wix-errors');

module.exports.GatekeeperAccessDenied = class GatekeeperAccessDenied extends wixSystemError(ErrorCode.GATEKEEPER_ACCESS_DENIED, HttpStatus.UNAUTHORIZED) {
  constructor(underlyingError) {
    super(underlyingError.message);
    this.name = this.constructor.name;
    this.underlyingError = underlyingError;
  }

  get metadata() {
    return this.underlyingError.metadata;
  }
};
