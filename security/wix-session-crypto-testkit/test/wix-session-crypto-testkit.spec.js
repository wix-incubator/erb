const {expect} = require('chai'),
  wixSessionCryptoProvider = require('wix-session-crypto'),
  testkitProvider = require('..'),
  NodeRSA = require('node-rsa'),
  jwtCrypto = require('wnp-jwt-crypto'),
  {nowPlusThreeMonths} = require('../lib/dates');

describe('wix session crypto testkit', () => {

  [{export: 'default', wixSessionCrypto: wixSessionCryptoProvider, testkit: testkitProvider},
    {export: 'v2', wixSessionCrypto: wixSessionCryptoProvider, testkit: testkitProvider.v2}]
    .forEach(config => {

      describe(config.export, () => {
        const {WixSessionCrypto, devKey} = config.wixSessionCrypto,
          testkit = config.testkit;

        it('should generate valid bundle bound to "wix-session-crypto" devKey', () => {
          const bundle = testkit.aValidBundle();
          const wixSessionCrypto = new WixSessionCrypto(devKey);
          const decryptedToken = wixSessionCrypto.decrypt(bundle.token);
          const decodedToken = wixSessionCrypto.decode(bundle.token);

          expect(decryptedToken).to.deep.equal(bundle.session);
          expect(decodedToken).to.deep.equal(bundle.sessionRaw);
          expect(JSON.parse(JSON.stringify(decryptedToken))).to.deep.equal(bundle.sessionJson);
        });

        it('should generate a bundle with expired session', () => {
          const bundle = testkit.anExpiredBundle();
          expect(bundle.session.expiration.getTime()).to.be.below(Date.now());
          expect(() => new WixSessionCrypto(bundle.publicKey).decrypt(bundle.token)).to.throw(wixSessionCryptoProvider.errors.SessionExpiredError);
        });

        it('should generate with expiration date in future', () => {
          const bundle = testkit.aValidBundle();
          expect(bundle.session.expiration.getTime()).to.be.gt(nowPlusThreeMonths() - 60 * 1000);
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
          const {privateKey, publicKey} = keyPair();
          const bundle = testkit.aValidBundle({privateKey, publicKey});
          expect(bundle.privateKey).to.equal(privateKey);
          expect(bundle.publicKey).to.equal(publicKey);
          expect(new WixSessionCrypto(publicKey).decrypt(bundle.token)).to.deep.equal(bundle.session);
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
            privateKey: key.exportKey('private'),
            publicKey: key.exportKey('public')
          };
        }        
        
      });
    });
});
