const {WixSessionCrypto, devKey, privateKey} = require('wix-session-crypto'),
  crypto = require('wnp-jwt-crypto'),
  chance = require('chance')(),
  {nowPlusThreeMonths, nowMinusOneDay} = require('./dates'),
  _ = require('lodash');
  
module.exports.aValidBundle = opts => aBundle(opts);
module.exports.anExpiredBundle = opts => {
  const expirationDateInPast = nowMinusOneDay();
  const expired = {session: {wxexp: expirationDateInPast, expiration: expirationDateInPast}};
  return aBundle(Object.assign({}, opts, expired));
};

function aBundle(opts = {}) {
  const expirationDayInFuture = nowPlusThreeMonths();
  const originalSession = aSession(opts.session || {}, expirationDayInFuture);
  const nonExpiredSession = Object.assign({}, originalSession);
  nonExpiredSession.wxexp = expirationDayInFuture;
  nonExpiredSession.expiration = expirationDayInFuture;
  const publicKey = opts.publicKey || devKey;
  const privKey = opts.privateKey || privateKey;
  const token = encrypt(originalSession, privKey);
  const session = new WixSessionCrypto(publicKey).decrypt(encrypt(nonExpiredSession, privKey));
  session.expiration = originalSession.expiration;
  return {
    publicKey: publicKey,
    privateKey: privKey,
    session,
    sessionJson: JSON.parse(JSON.stringify(session)),
    token,
    cookieName: 'wixSession2',
    sessionRaw: datesToString(originalSession)
  };
}

function encrypt(session, privateKey) {
  return 'JWT.' + crypto.encrypt({exp: session.wxexp.getTime(), data: JSON.stringify(session)}, {privateKey});
}

function datesToString(session) {
  return _.mapValues(session, v => {
    if (_.isDate(v)) {
      return v.toISOString();
    } else {
      return v;
    }
  });
}

function aSession(overrides, expiryDate) {
  const expirationDateInFuture = expiryDate;
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
