'use strict';
const expect = require('chai').expect,
  Chance = require('chance'),
  chance = new Chance(),
  wixSessionCrypto = require('..'),
  _ = require('lodash');

// token from the Scala framework tests
const token = `7ae0809c055858520a60b8c5d91f4f31024ab27d331d6f10baf206332c83ff9379655dfeb929cd18faf7aaad3a7df50c6d3f905f99ef14d93def7b14666d7c7c08399d90aaf1f47aa8ac1a29e92b308364a9559e20600ff77aa1a769bcb7482729a0376950e103160b547d8cb619177d8cb169914f52b5f9911160da03fd88608e8aa26bd03664144c370b15afdf17e068d75820e3b15ffcff99ad3853c1a3f43f36a6693785c282f884ab44bbae16f6ba480412ab8ec09a4d364ee0aba24888e3200a765acdcb5e18a8049495df892564bed41acc9c6e928f9aadbb13406432`;

describe('wix session crypto', () => {
  const validKey = 'kukuriku_1111111',
    invalidKey = 'someInvalidToken';

  it('should fail creating WixSessionCrypto without mainKey', () => {
    expect(wixSessionCrypto.get).to.throw(Error, 'mainKey is mandatory');
  });

  it('should encrypt a valid session', () => {
    let decoded = wixSessionCrypto.get(validKey).decrypt(token);

    expect(decoded).to.have.deep.property('email', 'someuser@wix.com');
    expect(decoded).to.have.deep.property('userName', 'someuser');
    expect(decoded).to.have.deep.property('userGuid', '11c23318-9006-414a-87cc-522649d327d7');
  });

  it('should encrypt and decrypt session', () => {
    let session = aSession();
    let sessionCrypto = wixSessionCrypto.get(validKey);

    expect(sessionCrypto.decrypt(sessionCrypto.encrypt(session))).to.deep.equal(session);
  });

  it('should throw an error on invalid token', function () {
    expect(() => wixSessionCrypto.get(invalidKey).decrypt(token)).to.throw(Error, /bad decrypt/);
  });

  function aSession() {
    return {
      uid: chance.integer(),
      permissions: chance.word(),
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
});