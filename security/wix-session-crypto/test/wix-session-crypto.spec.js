'use strict';
const expect = require('chai').expect,
  wixSessionCrypto = require('..'),
  errors = require('../lib/errors'),
  create = require('./support/create-session');

describe('wix session crypto', () => {

  describe('wixSession2', () => {
    const res = require('./resources/new-session');

    it('should export devKeys object to be used within dev environment', () => {
      expect(wixSessionCrypto.v2.devKey).to.be.defined;
    });

    it('should fail creating WixSessionCrypto without mainKey', () => {
      expect(() => wixSessionCrypto.v2.get()).to.throw(Error, 'pubKey is mandatory');
    });

    it('should convert pubKey into correct format', () => {
      const validSessionToken = create.v2({});
      wixSessionCrypto.v2.get(res.validKeyInInvalidFormat).decrypt(validSessionToken);
    });

    it('should decrypt and normalize a valid session', () => {
      const validSessionToken = create.v2({});
      let decoded = wixSessionCrypto.v2.get(res.validKey).decrypt(validSessionToken);

      expect(Object.keys(decoded).length).to.equal(6);

      expect(decoded.expiration).to.be.a('date');
      expect(decoded.userCreationDate).to.be.a('date');
      expect(decoded.userGuid).to.be.a('string');
      expect(decoded.userName).to.be.a('string');
      expect(decoded.wixStaff).to.be.a('boolean');
      expect(decoded.remembered).to.be.a('boolean');
    });

    it('should throw an error on mismatched decoding key', () => {
      const validSessionToken = create.v2({});
      expect(() => wixSessionCrypto.v2.get(res.invalidKey).decrypt(validSessionToken)).to.throw(errors.SessionMalformedError);
    });

    it('should throw an error for invalid token', () => {
      const validSessionToken = create.v2({});
      expect(() => wixSessionCrypto.v2.get(res.validKey).decrypt(validSessionToken.substr(2))).to.throw(errors.SessionMalformedError);
    });

    it('should throw an error for expired session', () => {
      const expiredSessionToken = create.v2({ expiration: new Date(Date.now() - 60 * 1000)});
      expect(() => wixSessionCrypto.v2.get(res.validKey).decrypt(expiredSessionToken)).to.throw(errors.SessionExpiredError);
    });

    it('should throw an error for expired jwt token', () => {
      const expiredSessionToken = create.v2({ jwtExpiration: new Date(Date.now() - 60 * 1000)});
      expect(() => wixSessionCrypto.v2.get(res.validKey).decrypt(expiredSessionToken)).to.throw(errors.SessionExpiredError);
    });

  });

  describe('wixSession', () => {
    const res = require('./resources/old-session');

    it('should export devKeys object to be used within dev environment', () => {
      expect(wixSessionCrypto.v1.devKey).to.be.defined;
    });

    it('should fail creating WixSessionCrypto without mainKey', () => {
      expect(() => wixSessionCrypto.v1.get()).to.throw(Error, 'mainKey is mandatory');
    });

    it('should decrypt and normalize a valid session', () => {
      const validSessionToken = create.v1(new Date(Date.now() + 60 * 1000));
      let decoded = wixSessionCrypto.v1.get(wixSessionCrypto.v1.devKey).decrypt(validSessionToken);

      expect(Object.keys(decoded).length).to.equal(6);

      expect(decoded.expiration).to.be.a('date');
      expect(decoded.userCreationDate).to.be.a('date');
      expect(decoded.userGuid).to.be.a('string');
      expect(decoded.userName).to.be.a('string');
      expect(decoded.wixStaff).to.be.a('boolean');
      expect(decoded.remembered).to.be.a('boolean');
    });

    it('should throw an error on invalid token', () => {
      const validSessionToken = create.v1(new Date(Date.now() + 60 * 1000));
      expect(() => wixSessionCrypto.v1.get(res.invalidKey).decrypt(validSessionToken)).to.throw(errors.SessionMalformedError);
    });

    it('should throw an error for expired session', () => {
      const expiredSessionToken = create.v1(new Date(Date.now() - 60 * 1000));
      expect(() => wixSessionCrypto.v1.get(wixSessionCrypto.v1.devKey).decrypt(expiredSessionToken)).to.throw(errors.SessionExpiredError);
    });

  });
});