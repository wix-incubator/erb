'use strict';
const expect = require('chai').expect,
  wixSessionCrypto = require('wix-session-crypto').v1,
  testkit = require('..');

describe('wix session crypto testkit', () => {

  it('should generate valid bundle bound to "wix-session-crypto" devKey', () => {
    const bundle = testkit.aValidBundle();
    const decryptedToken = wixSessionCrypto.get(wixSessionCrypto.devKey).decrypt(bundle.token);

    expect(decryptedToken).to.deep.equal(bundle.session);
    expect(JSON.parse(JSON.stringify(decryptedToken))).to.deep.equal(bundle.sessionJson);
  });

  it('should generate a bundle with expired session', () => {
    const bundle = testkit.anExpiredBundle();
    expect(bundle.session.expiration.getTime()).to.be.below(Date.now());
    expect(wixSessionCrypto.get(bundle.mainKey).decrypt(bundle.token).expiration.getTime()).to.equal(bundle.session.expiration.getTime());
  });

  it('should generate with expiration date in future', () => {
    const bundle = testkit.aValidBundle();
    expect(bundle.session.expiration.getTime()).to.be.gt(Date.now() + 60*60*1000);
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