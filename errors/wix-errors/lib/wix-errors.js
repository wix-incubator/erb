const HttpStatus = require('http-status-codes'),
  assert = require('assert');

const ErrorCode = {
  UNKNOWN: -100
};

const wixErrorBase = (errorCode = ErrorCode.UNKNOWN, httpStatus = HttpStatus.INTERNAL_SERVER_ERROR) => {

  assert(Number.isInteger(errorCode), 'errorCode must be provided and be a valid integer');
  assert.doesNotThrow(() => HttpStatus.getStatusText(httpStatus), 'HTTP status must be valid');

  return class extends Error {
    constructor(msg, cause) {
      super(msg);
      assert(msg && typeof(msg) === 'string', 'message is mandatory');
      assert(!cause || cause instanceof Error, 'cause has to be an instance of Error');
      this._cause = cause;
      this.name = this.constructor.name;
      generateStackTrace(this, cause);
    }
    
    get cause() {
      return this._cause;
    }

    get errorCode() {
      return errorCode;
    }

    get httpStatusCode() {
      return httpStatus;
    }
  }
};

function generateStackTrace(current, cause) {
  Error.captureStackTrace(current, current.constructor);
  if (cause) {
    current.stack = current.stack + '\nCaused By: ' + cause.stack;
  }
}

class WixError extends wixErrorBase(-100, HttpStatus.INTERNAL_SERVER_ERROR) {
  
  constructor(msg, cause) {
    super(msg, cause);
  }
}

module.exports.WixError = WixError;
module.exports.wixErrorBase = wixErrorBase;
module.exports.HttpStatus = HttpStatus;
module.exports.ErrorCode = ErrorCode;
