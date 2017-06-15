const {HttpStatus, wixSystemError} = require('wix-errors'),
  defaultLogger = require('wnp-debug')('wix-session-renewal');

const _16_MINUTES = 16 * 60 * 1000;
const SESSION_EXPIRED_ERROR_CODE = -12;

module.exports = (remote, crypto, toggler, logger = defaultLogger) => (req, res) => {
  
  const aspect = req.aspects['session'];
  
  if (needsValidation(aspect)) {
    return validateAtRemoteGracefully(req, res, aspect);
  } else {
    return Promise.resolve();
  }

  function validateAtRemoteGracefully(req, res, aspect) {
    return toggler(req)
      .then(enabled => {
        if (enabled) {
          const cookies = aspect.cookies;
          const session = crypto.decode(cookies['wixSession2']);
          return remote.client(req.aspects)
            .invoke('validate', {session})
            .catch(failGracefully)
            .then(ifValidCopyCookies(res));
        } else {
          return Promise.resolve();
        }
      });
    
  }

  function failGracefully(err) {
    logger.error('Communication with users segment failed', err);
    return Promise.resolve();
  }
};

function needsValidation(aspect) {
  return (Date.now() - aspect.lastValidationTime) > _16_MINUTES;
}

function ifValidCopyCookies(res) {
  return ({valid = true, cookies = []} = {valid: true, cookies: []}) => {
    if (!valid) {
      throw new SessionExpiredError();
    } else {
      cookies.forEach(({key, value, httpOnly, expirySeconds}) => res.cookie(key, value, {httpOnly, maxAge: expirySeconds * 1000}));
    }
  };
  
}

class SessionExpiredError extends wixSystemError(SESSION_EXPIRED_ERROR_CODE, HttpStatus.UNAUTHORIZED) {
  
  constructor() {
    super('Session has expired');
  }
}
