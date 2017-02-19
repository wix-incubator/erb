const wixSessionCrypto = require('wix-session-crypto').v2,
  crypto = require('wnp-jwt-crypto'),
  chance = require('chance')();

module.exports.aValidBundle = opts => aBundle(opts);
module.exports.anExpiredBundle = opts => {
  const expirationDateInPast = minusOneDay();
  const expired = {session: {wxexp: expirationDateInPast, expiration: expirationDateInPast}};
  return aBundle(Object.assign({}, opts, expired));
};

function aBundle(opts = {}) {
  const expirationDayInFuture = plusOneDay();
  const originalSession = aSession(opts.session || {});
  const nonExpiredSession = Object.assign({}, originalSession);
  nonExpiredSession.wxexp = expirationDayInFuture;
  nonExpiredSession.expiration = expirationDayInFuture;
  const publicKey = opts.publicKey || wixSessionCrypto.devKey;
  const privKey = opts.privateKey || wixSessionCrypto.privateKey;
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
  const expirationDateInFuture = plusOneDay();
  return Object.assign({}, {
    wxexp: expirationDateInFuture,
    expiration: expirationDateInFuture,
    lvld: expirationDateInFuture,//TODO: test
    lath: expirationDateInFuture,//TODO: test
    colors: {},
    rmb: chance.bool(),
    ucd: chance.date(),
    userGuid: chance.guid(),
    userName: chance.word(),
    wxs: chance.bool(),
    ewxd: chance.bool()
  }, overrides);
}

function plusOneDay() {
  return new Date(Date.now() + 60*60*24*1000);
}

function minusOneDay() {
  return new Date(Date.now() - 60*60*24*1000);
}
