'use strict';
const expect = require('chai').expect,
  wixSessionCrypto = require('wix-session-crypto'),
  testkit = require('..');


describe('wix session crypto testkit', () => {

  it('should generate valid bundle', () => {
    const bundle = testkit.aValidBundle();
    expect(wixSessionCrypto.get(bundle.mainKey).encrypt(bundle.session)).to.equal(bundle.token);
  });

  it('should generate with expiration date in future', () => {
    const bundle = testkit.aValidBundle();
    expect(bundle.session.expiration.getTime()).to.be.gt(Date.now() + 60*60*1000);
  });

  it('should provide valid cookie name in newly generated bundle', () => {
    expect(testkit.aValidBundle().cookieName).to.equal('wixSession');
  });

  it('should provide valid sessionJson', () => {
    const bundle = testkit.aValidBundle();
    expect(bundle.sessionJson).to.deep.equal(JSON.parse(JSON.stringify(bundle.session)));
  });

  it('should allow to provide custom encryption key (mainKey)', () => {
    const bundle = testkit.aValidBundle({mainKey: '1234211331224111'});
    expect(bundle.mainKey).to.equal('1234211331224111');
    expect(wixSessionCrypto.get('1234211331224111').encrypt(bundle.session)).to.equal(bundle.token);
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