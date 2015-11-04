'use strict';
const wixSession = require('wix-session'),
  cookieUtils = require('cookie-utils'),
  wixSessionCrypto = require('wix-session-crypto');

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
        wixSession.set(crypto.decrypt(token));
      }
      catch(e) {
        console.error(Error(`Failed to decrypt session token '${token}'`, e.message, e.stack));
      }
    }

    next();
  };
};

function wixSessionFromCookies(req) {
  return cookieUtils.fromHeader(req.headers['cookie']).wixSession;
}