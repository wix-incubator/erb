var wixDomainModule = require('wix-node-domain');
var cookiesUtil = require('cookies-utils')();
var wixSessionModule = require('wix-session');

/**
 * *
 * @param options mainKey: xxx, alternateKey: yyy
 * @returns {{middleware: middleware, session: session}}
 * TODO - option should have types : return 401 || redirect to login page || check only and save object
 */
module.exports = function () {
  return {
    middleware: middleware,
    session: function () {
      return wixDomainModule.wixDomain().wixSession
    }
  };

};

/**
 * options
 * - requireLogin {boolean} - prevent access to the route if a session is not present
 * - onMissingSession(req) - callback called on missing login cookie if requireLogin is set. If the callback is not provided
 *   we just return 401. The callback is expected to complete the request with content and response code.
 * - mainKey - see wix-session
 * - alternateKey - see wix-session
 * @param options
 * @returns {Function}
 */
var middleware = function (options) {
  var wixSession = wixSessionModule(options);

  function handleInvalidSession(res) {
    if (options.onMissingSession)
      options.onMissingSession(res);
    else {
      res.statusCode = 401;
      res.end('Banned');
    }
  }

  // I fix the tests but the logic is incorrect
  return function (req, res, next) {
    var cookies = cookiesUtil.toDomain(req.headers['cookie']);
    if (options.requireLogin && !cookies.wixSession) {
      handleInvalidSession(res);
    }
    else {
      var session = wixSession.fromStringToken(cookies.wixSession);
      if (!(session.isError)) {
        wixDomainModule.wixDomain().wixSession = session;
        next();
      } else {
        handleInvalidSession(res);
      }
    }
  }
};
