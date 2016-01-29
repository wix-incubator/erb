'use strict';
const wixSession = require('wix-session'),
  cookieUtils = require('cookie-utils'),
  wixSessionCrypto = require('wix-session-crypto'),
  log = require('wix-logger').get('wix-express-session');

module.exports.get = (mainKey, alternateKey) => {
  return (req, res, next) => {
    let crypto = wixSessionCrypto.get(mainKey, alternateKey);
    let current = wixSession.get();

    if (current) {
      throw new Error('wix session already populated.');
    }

    let token = wixSessionFromCookies(req);

    if (token) {

      try {
        const sessionJson = crypto.decrypt(token);

        if (!hasExpired(sessionJson)) {
          wixSession.set({token: token, session: sessionJson});
        } else {
          log.debug('Received expired session: ', sessionJson);
        }
      }
      catch(e) {
        log.error(`Failed to decrypt session token '${token}'`, e);
      }
    }

    next();
  };
};

function wixSessionFromCookies(req) {
  return cookieUtils.fromHeader(req.headers['cookie']).wixSession;
}

function hasExpired(sessionJson) {
  if (sessionJson.expiration) {
    return sessionJson.expiration.getTime() < Date.now();
  } else {
    return true;
  }
}