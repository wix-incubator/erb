'use strict';
const expect = require('chai').expect,
  wixSessionCrypto = require('wix-session-crypto'),
  testkit = require('..');


describe('wix session crypto testkit', () => {

  it('should generate valid bundle', () => {
    let bundle = testkit.aValidBundle();
    expect(wixSessionCrypto.get(bundle.mainKey).encrypt(bundle.session)).to.equal(bundle.token);
  });

  it('should provide valid cookie name in newly generated bundle', () => {
    expect(testkit.aValidBundle().cookieName).to.equal('wixSession');
  });

  it('should provide valid sessionJson', () => {
    let bundle = testkit.aValidBundle();
    expect(bundle.sessionJson).to.deep.equal(JSON.parse(JSON.stringify(bundle.session)));
  });
});