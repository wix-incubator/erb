'use strict';
const wixSessionCrypto = require('wix-session-crypto'),
  Chance = require('chance'),
  chance = new Chance();

module.exports.aValidBundle = function() {
  let session = aSession();
  let mainKey = '1qaz2wsx3edc4rfv';
  let token = wixSessionCrypto.get(mainKey).encrypt(session);
  return {
    mainKey,
    session,
    sessionJson: JSON.parse(JSON.stringify(session)),
    token,
    cookieName: 'wixSession'};
};

function aSession() {
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
    expiration: chance.date(),
    userCreationDate: chance.date(),
    version: chance.integer({min: 0, max: 10}),
    colors: {}
  };
}
