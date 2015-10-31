'use strict';
var wixDomain = require('wix-domain');
var cookiesUtil = require('cookies-utils');
var url = require('url');

/**
 * returns a function to handle require login
 * - requireLogin {boolean} - prevent access to the route if a session is not present
 * - onMissingSession(req) - callback called on missing login cookie if requireLogin is set. If the callback is not provided
 *   we just return 401. The callback is expected to complete the request with content and response code.
 * @param wixSessionService - see wix-session module
 * @returns {RequireLoginService}
 */
module.exports = function getTheService(wixSessionService) {
  return new RequireLoginService(wixSessionService);
}

/**
 * @param wixSessionService
 * @constructor
 */
function RequireLoginService(wixSessionService) {
  this.wixSessionService = wixSessionService;
}

RequireLoginService.prototype.requireLogin = function () {
  return _requireLogin(this.wixSessionService, true);
};

RequireLoginService.prototype.trackSession = function () {
  return _requireLogin(this.wixSessionService, false);
};

RequireLoginService.prototype.requireLoginWithCallback = function (callback) {
  return _requireLogin(this.wixSessionService, true, callback);
};

RequireLoginService.prototype.requireLoginWithRedirect = function () {
  function redirect(req, res) {
    var originalUrl = req.protocol + "://" + req.get('host') + req.originalUrl;

    res.redirect(302, url.format({
      protocol: "https",
      hostname: "www.wix.com",
      pathname: "signin",
      query: {postLogin: originalUrl}
    }));
    res.end()
  }

  return _requireLogin(this.wixSessionService, true, redirect);
};

RequireLoginService.prototype.wixSession = function wixSession() {
  return wixDomain.get().wixSession
};

function _requireLogin(wixSessionService, requireLogin, onMissingSession) {

  function handleInvalidSession(req, res) {
    if (onMissingSession)
      onMissingSession(req, res);
    else {
      res.statusCode = 401;
      res.end('Banned');
    }
  }

  function proceedWithSession(session, next) {
    wixDomain.get().wixSession = session;
    next();
  }

  // I fix the tests but the logic is incorrect
  return function (req, res, next) {
    var cookies = cookiesUtil.toDomain(req.headers['cookie']);

    // todo test
    // reuse the parsed session if a prior middleware has parsed it already
    var session = wixDomain.get().wixSession;
    if (!session)
      session = wixSessionService.fromStringToken(cookies.wixSession);

    if (requireLogin && session.isError)
      handleInvalidSession(req, res);
    else
      proceedWithSession(session, next);
  }
}

