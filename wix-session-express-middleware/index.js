var wixDomainModule = require('wix-node-domain');
var cookiesUtil = require('cookies-utils');

module.exports = getTheService;

/**
 * returns a function to handle require login
 * - requireLogin {boolean} - prevent access to the route if a session is not present
 * - onMissingSession(req) - callback called on missing login cookie if requireLogin is set. If the callback is not provided
 *   we just return 401. The callback is expected to complete the request with content and response code.
 * @param wixSessionService - see wix-session module
 * @returns {RequireLoginService}
 */
function getTheService(wixSessionService) {
  return new RequireLoginService(wixSessionService);
}

/**
 * @param wixSessionService
 * @constructor
 */
function RequireLoginService(wixSessionService) {
  this.wixSessionService = wixSessionService;
}

RequireLoginService.prototype.requireLogin = function() {
  return _requireLogin(this.wixSessionService, true);
};

RequireLoginService.prototype.trackSession = function() {
  return _requireLogin(this.wixSessionService, false);
};

RequireLoginService.prototype.requireLoginWithCallback = function(callback) {
  return _requireLogin(this.wixSessionService, true, callback);
};

RequireLoginService.prototype.wixSession = function wixSession() {
  return wixDomainModule.wixDomain().wixSession
};

function _requireLogin(wixSessionService, requireLogin, onMissingSession) {

  function handleInvalidSession(res) {
    if (onMissingSession)
      onMissingSession(res);
    else {
      res.statusCode = 401;
      res.end('Banned');
    }
  }

  function proceedWithSession(session, next) {
    wixDomainModule.wixDomain().wixSession = session;
    next();
  }

  // I fix the tests but the logic is incorrect
  return function (req, res, next) {
    var cookies = cookiesUtil.toDomain(req.headers['cookie']);

    // todo test
    // reuse the parsed session if a prior middleware has parsed it already
    var session = wixDomainModule.wixDomain().wixSession;
    if (!session)
      session = wixSessionService.fromStringToken(cookies.wixSession);
    if (requireLogin && session.isError)
      handleInvalidSession(res);
    else
      proceedWithSession(session, next);
  }
}

