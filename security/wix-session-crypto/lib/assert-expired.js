'use strict';
const SessionExpiredError = require('./errors').SessionExpiredError;

module.exports = toCheck => {
  if (Date.now() > toCheck.getTime()) {
    throw new SessionExpiredError('expiration date: ' + toCheck);
  }
};