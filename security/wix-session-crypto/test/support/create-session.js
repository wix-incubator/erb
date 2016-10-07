'use strict';
const crypto = require('wix-crypto'),
  jwtCrypto = require('wnp-jwt-crypto'),
  chance = require('chance')(),
  v1 = require('../../index').v1,
  v2 = require('../../index').v2;

module.exports.v1 = expirationUTC => encryptAsWixSession(aWixSession(expirationUTC), v1.devKey);
module.exports.v2 = opts => encryptAsWixSession2(aWixSession2({wxexp: opts.expiration || new Date(Date.now() + 60*60*24*1000)}), v2.privateKey, opts.jwtExpiration);

function aWixSession(expiration) {
  return {
    uid: chance.integer({min: 1, max: 20000}),
    permissions: chance.integer({min: 1, max: 10}),
    userGuid: chance.guid(),
    userName: chance.word(),
    email: chance.email(),
    mailStatus: chance.word(),
    userAgent: chance.word(),
    isWixStaff: chance.bool(),
    isRemembered: chance.bool(),
    expiration: expiration.getTime(),
    userCreationDate: chance.date(),
    version: chance.integer({min: 0, max: 10}),
    colors: {}
  };
}

function encryptAsWixSession(session, mainKey) {
  const tokenValues = [];

  Object.keys(v1.sessionTemplate).forEach(key => {
    let value = session[key];
    tokenValues.push((value instanceof Date) ? value.getTime() : value);
  });

  tokenValues[tokenValues.length - 1] = JSON.stringify(session.colors);

  return crypto.encrypt(tokenValues.join(v1.delimiter), {mainKey});
}

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