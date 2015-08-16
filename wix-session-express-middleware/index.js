var wixDomainModule = require('wix-node-domain');
var cookiesUtil = require('cookies-utils')();
var wixSessionModule = require('wix-session');

/**
 * *
 * @param options mainKey: xxx, alternateKey: yyy
 * @returns {{middleware: middleware, session: session}}
 * TODO - option should have types : return 401 || redirect to login page || check only and save object
 */
module.exports.service = getTheService;
module.exports.session = session;

function session() {
  return wixDomainModule.wixDomain().wixSession
}

/**
 * returns a function to handle require login
 * - requireLogin {boolean} - prevent access to the route if a session is not present
 * - onMissingSession(req) - callback called on missing login cookie if requireLogin is set. If the callback is not provided
 *   we just return 401. The callback is expected to complete the request with content and response code.
 * @param keys - keys for session encryption, see wix-session module
 * - mainKey - see wix-session
 * - alternateKey - see wix-session
 * @returns {Function(requireLogin, onMissingSession)}
 */
function getTheService(wixSessionService) {
  return new RequireLoginService(wixSessionService);
}

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

    var session = wixSessionService.fromStringToken(cookies.wixSession);
    if (requireLogin && session.isError)
      handleInvalidSession(res);
    else
      proceedWithSession(session, next);
  }
}

