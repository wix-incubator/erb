const expect = require('chai').expect,
  {WixSessionCrypto, devKey, errors} = require('..'),
  create = require('./support/create-session');

describe('wix session crypto', () => {

  describe('wixSession2', () => {
    const res = require('./resources/new-session');

    it('should export devKeys object to be used within dev environment', () => {
      expect(devKey).to.be.defined;
    });

    it('should fail creating WixSessionCrypto without mainKey', () => {
      expect(() => new WixSessionCrypto()).to.throw(Error, 'pubKey is mandatory');
    });

    it('should convert pubKey into correct format', () => {
      const validSessionToken = create({});
      new WixSessionCrypto(res.validKeyInInvalidFormat).decrypt(validSessionToken);
    });

    it('should decrypt and normalize a valid session', () => {
      const validSessionToken = create({});
      let decoded = new WixSessionCrypto(res.validKey).decrypt(validSessionToken);

      expect(Object.keys(decoded).length).to.equal(6);

      expect(decoded.expiration).to.be.a('date');
      expect(decoded.userCreationDate).to.be.a('date');
      expect(decoded.userGuid).to.be.a('string');
      expect(decoded.userName).to.be.a('string');
      expect(decoded.wixStaff).to.be.a('boolean');
      expect(decoded.remembered).to.be.a('boolean');
    });

    it('should throw an error on mismatched decoding key', () => {
      const validSessionToken = create({});
      expect(() => new WixSessionCrypto(res.invalidKey).decrypt(validSessionToken)).to.throw(errors.SessionMalformedError);
    });

    it('should throw an error for invalid token', () => {
      const validSessionToken = create({});
      expect(() => new WixSessionCrypto(res.validKey).decrypt(validSessionToken.substr(2))).to.throw(errors.SessionMalformedError);
    });

    it('should throw an error for expired session', () => {
      const expiredSessionToken = create({ expiration: new Date(Date.now() - 60 * 1000)});
      expect(() => new WixSessionCrypto(res.validKey).decrypt(expiredSessionToken)).to.throw(errors.SessionExpiredError);
    });

    it('should throw an error for expired jwt token', () => {
      const expiredSessionToken = create({ jwtExpiration: new Date(Date.now() - 60 * 1000)});
      expect(() => new WixSessionCrypto(res.validKey).decrypt(expiredSessionToken)).to.throw(errors.SessionExpiredError);
    });

  });
});
