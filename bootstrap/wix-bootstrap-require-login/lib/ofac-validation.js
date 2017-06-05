const {wixSystemError, HttpStatus} = require('wix-errors');

const BLOCKED_COUNTRIES = ['IR', 'CU', 'SD', 'SY', 'KP'];
const OFAC_COUNTRY_NOT_ALLOWED = -16;

class OfacCountryInvalidSessionError extends wixSystemError(OFAC_COUNTRY_NOT_ALLOWED, HttpStatus.BAD_REQUEST) {
  
  constructor() {
    super('Session invalidated since request from OFAC country');
  }
}

module.exports = req => {
  const geo = req.aspects['web-context'].geo;
  let result = Promise.resolve();
  if (geo && geo['2lettersCountryCode']) {
    if (BLOCKED_COUNTRIES.includes(geo['2lettersCountryCode'].toUpperCase())) {
      result = Promise.reject(new OfacCountryInvalidSessionError());
    }
  }
  return result;
}; 
