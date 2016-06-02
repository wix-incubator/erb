'use strict';
const wixSessionCrypto = require('wix-session-crypto').v1,
  crypto = require('wix-crypto'),
  chance = require('chance')(),
  _ = require('lodash');

module.exports.aValidBundle = opts => aBundle(opts);
module.exports.anExpiredBundle = opts => {
  const expired = {session: {expiration: new Date(new Date().getTime() - 60)}};
  return aBundle(_.merge(opts || {}, expired));
};

function aBundle(opts) {
  const options = opts || {};
  const originalSession = aSession(options.session || {});
  const mainKey = options.mainKey || wixSessionCrypto.devKey;
  const token = encrypt(originalSession, mainKey);
  const session = wixSessionCrypto.get(mainKey).decrypt(token);
  return {
    mainKey,
    session,
    sessionJson: JSON.parse(JSON.stringify(session)),
    token,
    cookieName: 'wixSession'
  };
}

function encrypt(session, mainKey) {
  const tokenValues = [];

  _.each(wixSessionCrypto.sessionTemplate, (index, key) => {
    let value = session[key];
    tokenValues.push((value instanceof Date) ? value.getTime() : value);
  });

  tokenValues[tokenValues.length - 1] = JSON.stringify(session.colors);

  return crypto.encrypt(tokenValues.join(wixSessionCrypto.delimiter), {mainKey});
}


function aSession(overrides) {
  return _.merge({
    uid: chance.integer({min: 1, max: 20000}),
    permissions: chance.integer({min: 1, max: 10}),
    userGuid: chance.guid(),
    userName: chance.word(),
    email: chance.email(),
    mailStatus: chance.word(),
    userAgent: chance.word(),
    isWixStaff: chance.bool(),
    isRemembered: chance.bool(),
    expiration: new Date(Date.now() + 60*60*24*1000),
    userCreationDate: chance.date(),
    version: chance.integer({min: 0, max: 10}),
    colors: {}
  }, overrides);
}
