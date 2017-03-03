const jwtCrypto = require('wnp-jwt-crypto'),
  chance = require('chance')(),
  {privateKey} = require('../..');

function encryptAsWixSession2(session, privateKey, jwtExpiration) {
  const exp = (jwtExpiration ? jwtExpiration.getTime() : Date.now() + 60 * 1000) / 1000;
  return 'JWT.' + jwtCrypto.encrypt({exp, data: JSON.stringify(session)}, {privateKey});
}

function aWixSession2(overrides) {
  return Object.assign({}, {
    rmb: chance.bool(),
    ucd: chance.date(),
    userGuid: chance.guid(),
    userName: chance.word(),
    wxs: chance.bool()
  }, overrides);
}

module.exports = function createSession(opts) {
  const sessionData = aWixSession2({wxexp: opts.expiration || new Date(Date.now() + 60*60*24*1000)})
  return encryptAsWixSession2(sessionData, privateKey, opts.jwtExpiration);
};
