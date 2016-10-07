'use strict';
const wixSessionCrypto = require('wix-session-crypto').v2,
  crypto = require('wnp-jwt-crypto'),
  chance = require('chance')();

module.exports.aValidBundle = opts => aBundle(opts);
module.exports.anExpiredBundle = opts => {
  const expiration = new Date(new Date().getTime() - 60 * 60 * 1000);
  const expired = {session: {wxexp: expiration, expiration}};
  return aBundle(Object.assign({}, opts, expired));
};

function aBundle(opts) {
  const options = opts || {};
  const originalSession = aSession(options.session || {});
  const nonExpiredSession = Object.assign({}, originalSession);
  nonExpiredSession.wxexp = new Date(Date.now() + 60 * 60 * 1000);
  nonExpiredSession.expiration = nonExpiredSession.wxexp;
  const publicKey = options.publicKey || wixSessionCrypto.devKey;
  const privKey = options.privateKey || wixSessionCrypto.privateKey;
  const token = encrypt(originalSession, privKey);
  const session = wixSessionCrypto.get(publicKey).decrypt(encrypt(nonExpiredSession, privKey));
  session.expiration = originalSession.expiration;
  return {
    publicKey: publicKey,
    privateKey: privKey,
    session,
    sessionJson: JSON.parse(JSON.stringify(session)),
    token,
    cookieName: 'wixSession2'
  };
}

function encrypt(session, privateKey) {
  return 'JWT.' + crypto.encrypt({exp: session.wxexp.getTime(), data: JSON.stringify(session)}, {privateKey});
}

function aSession(overrides) {
  return Object.assign({}, {
    wxexp: new Date(Date.now() + 60*60*24*1000),
    expiration: new Date(Date.now() + 60*60*24*1000),
    rmb: chance.bool(),
    ucd: chance.date(),
    userGuid: chance.guid(),
    userName: chance.word(),
    wxs: chance.bool()
  }, overrides);
}