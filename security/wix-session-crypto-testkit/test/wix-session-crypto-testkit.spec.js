'use strict';
const expect = require('chai').expect,
  wixSessionCryptoProvider = require('wix-session-crypto'),
  testkitProvider = require('..'),
  NodeRSA = require('node-rsa'),
  jwtCrypto = require('wnp-jwt-crypto');

describe('wix session crypto testkit', () => {

  [{export: 'default', crypto: wixSessionCryptoProvider.v1, testkit: testkitProvider},
    {export: 'v1', crypto: wixSessionCryptoProvider.v1, testkit: testkitProvider.v1}]
    .forEach(config => {

      describe(config.export, () => {
        const wixSessionCrypto = config.crypto,
          testkit = config.testkit;

        it('should generate valid bundle bound to "wix-session-crypto" devKey', () => {
          const bundle = testkit.aValidBundle();
          const decryptedToken = wixSessionCrypto.get(wixSessionCrypto.devKey).decrypt(bundle.token);

          expect(decryptedToken).to.deep.equal(bundle.session);
          expect(JSON.parse(JSON.stringify(decryptedToken))).to.deep.equal(bundle.sessionJson);
        });

        it('should generate a bundle with expired session', () => {
          const bundle = testkit.anExpiredBundle();
          expect(bundle.session.expiration.getTime()).to.be.below(Date.now());
          expect(() => wixSessionCrypto.get(bundle.mainKey).decrypt(bundle.token)).to.throw(wixSessionCryptoProvider.errors.SessionExpiredError);
        });

        it('should generate with expiration date in future', () => {
          const bundle = testkit.aValidBundle();
          expect(bundle.session.expiration.getTime()).to.be.gt(Date.now() + 60 * 60 * 1000);
        });

        it('should provide valid cookie name in newly generated bundle', () => {
          expect(testkit.aValidBundle().cookieName).to.equal('wixSession');
        });

        it('should allow to provide custom encryption key (mainKey)', () => {
          const bundle = testkit.aValidBundle({mainKey: '1234211331224111'});
          expect(bundle.mainKey).to.equal('1234211331224111');
          expect(wixSessionCrypto.get('1234211331224111').decrypt(bundle.token)).to.deep.equal(bundle.session);
        });

        it('should allow to override session json fields', () => {
          const bundle = testkit.aValidBundle({
            session: {
              userGuid: 'overriden_guid'
            }
          });
          expect(bundle.session).to.contain.deep.property('userGuid', 'overriden_guid');
        });
      });
    });

  describe('v2', () => {
    const wixSessionCrypto = wixSessionCryptoProvider.v2,
      testkit = testkitProvider.v2;

    it('should generate valid bundle bound to "wix-session-crypto" devKey', () => {
      const bundle = testkit.aValidBundle();
      const decryptedToken = wixSessionCrypto.get(wixSessionCrypto.devKey).decrypt(bundle.token);

      expect(decryptedToken).to.deep.equal(bundle.session);
      expect(JSON.parse(JSON.stringify(decryptedToken))).to.deep.equal(bundle.sessionJson);
    });

    it('should generate a bundle with expired session', () => {
      const bundle = testkit.anExpiredBundle();
      expect(bundle.session.expiration.getTime()).to.be.below(Date.now());
      expect(() => wixSessionCrypto.get(bundle.publicKey).decrypt(bundle.token)).to.throw(wixSessionCryptoProvider.errors.SessionExpiredError);
    });

    it('should generate with expiration date in future', () => {
      const bundle = testkit.aValidBundle();
      expect(bundle.session.expiration.getTime()).to.be.gt(Date.now() + 60 * 60 * 1000);
    });

    it('should generate jwt token with expiration claim present and equal to expiration date within data', () => {
      const bundle = testkit.aValidBundle();
      const decoded = jwtCrypto.decrypt(bundle.token.substring(4), {publicKey: bundle.publicKey});
      const data = JSON.parse(decoded.data);
      expect(new Date(data.wxexp).getTime()).to.equal(decoded.exp);
    });


    it('should provide valid cookie name in newly generated bundle', () => {
      expect(testkit.aValidBundle().cookieName).to.equal('wixSession2');
    });

    it('should allow to provide custom encryption key (mainKey)', () => {
      const keys = keyPair();
      const bundle = testkit.aValidBundle({privateKey: keys.private, publicKey: keys.public});
      expect(bundle.privateKey).to.equal(keys.private);
      expect(bundle.publicKey).to.equal(keys.public);
      expect(wixSessionCrypto.get(keys.public).decrypt(bundle.token)).to.deep.equal(bundle.session);
    });

    it('should allow to override session json fields', () => {
      const bundle = testkit.aValidBundle({
        session: {
          userGuid: 'overriden_guid'
        }
      });
      expect(bundle.session).to.contain.deep.property('userGuid', 'overriden_guid');
    });

    function keyPair() {
      const key = new NodeRSA({b: 512});

      return {
        private: key.exportKey('private'),
        public: key.exportKey('public')
      };
    }
  });

});