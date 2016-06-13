'use strict';
const expect = require('chai').expect,
  wixSessionCrypto = require('..');

describe('wix session crypto', () => {

  describe('new session', () => {
    const res = require('./resources/new-session');

    it('should export devKeys object to be used within dev environment', () => {
      expect(wixSessionCrypto.v2.devKey).to.equal(res.validKey);
    });

    it('should fail creating WixSessionCrypto without mainKey', () => {
      expect(() => wixSessionCrypto.v2.get()).to.throw(Error, 'pubKey is mandatory');
    });

    it.only('should it should convert pubKey into correct format', () => {
      let decoded = wixSessionCrypto.v2.get(res.validKeyInInvalidFormat).decrypt(res.token);

      expect(Object.keys(decoded).length).to.equal(6);

      expect(decoded.expiration.getDate()).to.equal(res.objectInToken.expiration.getDate());
      expect(decoded.userCreationDate.getDate()).to.equal(res.objectInToken.userCreationDate.getDate());
      expect(decoded.userGuid).to.equal(res.objectInToken.userGuid);
      expect(decoded.userName).to.equal(res.objectInToken.userName);
      expect(decoded.colors).to.be.undefined;
      expect(decoded.wixStaff).to.equal(res.objectInToken.wixStaff);
      expect(decoded.remembered).to.equal(res.objectInToken.remembered);
    });
    it('should decrypt and normalize a valid session', () => {
      let decoded = wixSessionCrypto.v2.get(res.validKey).decrypt(res.token);

      expect(Object.keys(decoded).length).to.equal(6);

      expect(decoded.expiration.getDate()).to.equal(res.objectInToken.expiration.getDate());
      expect(decoded.userCreationDate.getDate()).to.equal(res.objectInToken.userCreationDate.getDate());
      expect(decoded.userGuid).to.equal(res.objectInToken.userGuid);
      expect(decoded.userName).to.equal(res.objectInToken.userName);
      expect(decoded.colors).to.be.undefined;
      expect(decoded.wixStaff).to.equal(res.objectInToken.wixStaff);
      expect(decoded.remembered).to.equal(res.objectInToken.remembered);
    });

    it('should throw an error on invalid token', function () {
      expect(() => wixSessionCrypto.v2.get(res.invalidKey).decrypt(res.token)).to.throw(Error, /invalid signature/);
    });

  });

  describe('old session', () => {
    const res = require('./resources/old-session');

    it('should export devKeys object to be used within dev environment', () => {
      expect(wixSessionCrypto.v1.devKey).to.be.defined;
    });

    it('should fail creating WixSessionCrypto without mainKey', () => {
      expect(() => wixSessionCrypto.v1.get()).to.throw(Error, 'mainKey is mandatory');
    });

    it('should decrypt and normalize a valid session', () => {
      let decoded = wixSessionCrypto.v1.get(res.validKey).decrypt(res.token);

      expect(Object.keys(decoded).length).to.equal(6);

      expect(decoded.expiration.getDate()).to.equal(res.objectInToken.expiration.getDate());
      expect(decoded.userCreationDate.getDate()).to.equal(res.objectInToken.userCreationDate.getDate());
      expect(decoded.userGuid).to.equal(res.objectInToken.userGuid);
      expect(decoded.userName).to.equal(res.objectInToken.userName);
      expect(decoded.colors).to.be.undefined;
      expect(decoded.wixStaff).to.equal(res.objectInToken.isWixStaff);
      expect(decoded.remembered).to.equal(res.objectInToken.isRemembered);
    });

    it('should throw an error on invalid token', function () {
      expect(() => wixSessionCrypto.v1.get(res.invalidKey).decrypt(res.token)).to.throw(Error, /bad decrypt/);
    });
  });
});