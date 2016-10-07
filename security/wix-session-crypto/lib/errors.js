'use strict';

class SessionExpiredError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class SessionMalformedError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports.SessionExpiredError = SessionExpiredError;
module.exports.SessionMalformedError = SessionMalformedError;
