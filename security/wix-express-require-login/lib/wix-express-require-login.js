const assert = require('assert'),
  {HttpStatus, ErrorCode, wixSystemError} = require('wix-errors');

class SessionRequiredError extends wixSystemError(ErrorCode.SESSION_REQUIRED, HttpStatus.UNAUTHORIZED) {
  
  constructor() {
    super('Session required');
  }
}

function forbid(req, res, next) {
  next(new SessionRequiredError());
}

function redirect(resolveRedirectUrl) {
  return (req, res) => {
    return res.redirect(resolveRedirectUrl(req));
  }
}

function hasSession(session) {
  return session && session.userGuid;
}

function requireLoginIfNoSession(noLoginHandler) {
  assert(noLoginHandler, 'No handler was provided');
  return (req, res, next) => hasSession(req.aspects.session) ? next() : noLoginHandler(req, res, next);
}

module.exports.forbid = forbid;
module.exports.redirect = redirect;
module.exports.requireLogin = requireLoginIfNoSession;
