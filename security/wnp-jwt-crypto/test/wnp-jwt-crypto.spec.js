const jwtCrypto = require('..'),
  NodeRSA = require('node-rsa'),
  expect = require('chai').expect;

describe('wnp-jwt-crypto', () => {

  it('should encrypt/decrypt a token', () => {
    const data = {token: 'data-token'};
    const keys = keyPair();
    const encrypted = jwtCrypto.encrypt(data, {privateKey: keys.private});
    expect(jwtCrypto.decrypt(encrypted, {publicKey: keys.public})).to.contain.deep.property('token', 'data-token');
  });

  it('should fail to decrypt with non-matching keys', () => {
    const data = {token: 'data-token'};
    const pairOne = keyPair();
    const pairTwo = keyPair();
    const encrypted = jwtCrypto.encrypt(data, {privateKey: pairOne.private});

    expect(() => jwtCrypto.decrypt(encrypted, {publicKey: pairTwo.public})).to.throw(Error);
  });

  describe('decrypt', () => {
    it('should fail if options is not provided', () => {
      expect(() => jwtCrypto.decrypt('data')).to.throw('options.publicKey is mandatory');
    });

    it('should fail if options.publicKey is not provided', () => {
      expect(() => jwtCrypto.decrypt('data', {})).to.throw('options.publicKey is mandatory');
    });

    it('should not validate expiration given "ignoreExpiration" is set', () => {
      const minus30Sec = Math.floor(Date.now() / 1000) - 30;
      const data = {token: 'data-token', iat: minus30Sec, exp: 10};
      const keys = keyPair();
      const encrypted = jwtCrypto.encrypt(data, {privateKey: keys.private});
      expect(() => jwtCrypto.decrypt(encrypted, {publicKey: keys.public, ignoreExpiration: true})).to.not.throw(Error);
    });

    it('should validate expiration by default', () => {
      const minus30Sec = Math.floor(Date.now() / 1000) - 30;
      const data = {token: 'data-token', iat: minus30Sec, exp: 10};
      const keys = keyPair();
      const encrypted = jwtCrypto.encrypt(data, {privateKey: keys.private});
      expect(() => jwtCrypto.decrypt(encrypted, {publicKey: keys.public})).to.throw(Error);
    });
  });

  describe('encrypt', () => {
    it('should fail if options is not provided', () => {
      expect(() => jwtCrypto.encrypt('data')).to.throw('options.privateKey is mandatory');
    });

    it('should fail if options.publicKey is not provided', () => {
      expect(() => jwtCrypto.encrypt('data', {})).to.throw('options.privateKey is mandatory');
    });
  });
});

function keyPair() {
  const key = new NodeRSA({b: 512});

  return {
    private: key.exportKey('private'),
    public: key.exportKey('public')
  };
}
