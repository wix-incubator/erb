'use strict';
const builder = require('..').builder,
  chai = require('chai'),
  expect = chai.expect,
  cookieUtils = require('cookie-utils'),
  chance = require('chance')(),
  testkit = require('wix-session-crypto-testkit');


chai.use(require('./matchers'));

describe('wix req options', () => {

  it('should add web-context related headers by default', () => {
    const options = builder().options();
    expect(options).to.be.likeObject({
      headers: {
        'x-wix-default_port': '2222',
        'x-wix-ip': '1.1.1.1',
        'x-wix-url': 'http://www.kfir.com',
        'x-wix-language': 'pt',
        'x-wix-country-code': 'BR'
      }
    });
    expect(options).to.contain.deep.property('headers.x-wix-request-id').that.is.validGuid();
  });

  it('should not add cookie header by default', () => {
    const options = builder().options();
    expect(options).to.not.contain.deep.property('headers.cookie');
  });

  it('should add bi-related cookies with defaults', () => {
    const reqOptions = builder().withBi();
    const options = reqOptions.options();

    expect(cookieUtils.fromHeader(options.headers.cookie)).to.deep.equal(reqOptions.cookies);

    expect(reqOptions.cookies).to.contain.deep.property('_wixUIDX').that.is.validGuid();
    expect(reqOptions.cookies).to.contain.deep.property('_wixCIDX').that.is.validGuid();
    expect(reqOptions.cookies).to.contain.deep.property('_wix_browser_sess').that.is.validGuid();
    expect(reqOptions.cookies).to.contain.deep.property('userType').that.is.validGuid();
  });

  describe('petri', () => {

    it('should add anonymous petri cookie with defaults', () => {
      const reqOptions = builder().withPetriAnonymous().options();
      expect(reqOptions).to.contain.deep.property('headers.cookie', '_wixAB3=1%231');
    });

    it('should add anonymous petri cookie with custom specId and specValue', () => {
      const reqOptions = builder().withPetriAnonymous(4, 10).options();
      expect(reqOptions).to.contain.deep.property('headers.cookie', '_wixAB3=4%2310');
    });

    it('should fail when adding anonymous cookie with just 1 arg', () => {
      expect(() => builder().withPetriAnonymous('1')).to.throw();
    });

    it('should add user petri cookie with defaults', () => {
      const reqOptions = builder().withPetri().options();
      expect(reqOptions).to.contain.deep.property('headers.cookie').that.is.string('_wixAB3|');
    });

    it('should add user petri cookie with custom userId', () => {
      const userId = chance.guid();
      const reqOptions = builder().withPetri(userId).options();
      expect(reqOptions).to.contain.deep.property('headers.cookie', `_wixAB3|${userId}=1%231`);
    });

    it('should add anonymous petri cookie with custom userId, specId and specValue', () => {
      const userId = chance.guid();
      const reqOptions = builder().withPetri(userId, 4, 10).options();
      expect(reqOptions).to.contain.deep.property('headers.cookie', `_wixAB3|${userId}=4%2310`);
    });

    it('should fail when adding anonymous cookie with 2 args', () => {
      expect(() => builder().withPetri('1', '1')).to.throw();
    });
  });

  describe('petri', () => {

    it('should add petri override cookie', () => {
      const reqOptions = builder().withPetriOverride('aSpec', 'aValue').options();
      expect(reqOptions.headers.cookie).to.equal('petri_ovr=aSpec%23aValue');
    });

    it('should add multiple petri override cookie', () => {
      const reqOptions = builder()
          .withPetriOverride('aSpec', 'aValue')
          .withPetriOverride('aSpec2', 'aValue2')
          .options();

      expect(reqOptions.headers.cookie).to.equal('petri_ovr=aSpec%23aValue%7CaSpec2%23aValue2');
    });

  });

  describe('wix session', () => {
    
    it('should add session cookie with defaults', () => {
      const reqOptions = builder().withSession();
      const options = reqOptions.options();
      
      expect(options.headers.cookie).to.be.string(`${reqOptions.wixSession.cookieName}=${reqOptions.wixSession.token}`);
    });

    it('should add session cookie using custom bundle', () => {
      const bundle = testkit.v1.aValidBundle({mainKey: '1234211331224111'});

      const reqOptions = builder().withSession(bundle);
      const options = reqOptions.options();

      expect(reqOptions.wixSession.mainKey).to.equal('1234211331224111');
      expect(options.headers.cookie).to.be.string(`${reqOptions.wixSession.cookieName}=${reqOptions.wixSession.token}`);
    });

    it('should allow to add multiple sessions with different session cookie names', () => {
      const bundleV1 = testkit.v1.aValidBundle();
      const bundleV2 = testkit.v2.aValidBundle();

      const reqOptions = builder().withSession(bundleV1).withSession(bundleV2);
      const options = reqOptions.options();

      expect(reqOptions.wixSession.cookieName).to.equal('wixSession2');
      expect(options.headers.cookie).to.be.string('wixSession2=');
      expect(options.headers.cookie).to.be.string('wixSession=');
    });

  });

  describe('withHeader', () => {
    it('should allow to add any header', () => {
      const reqOptions = builder().withHeader('headerName', 'headerValue').options();
      expect(reqOptions.headers).to.contain.property('headerName', 'headerValue');
    })
  });

  describe('withCookie', () => {
    it('should allow to add any cookie', () => {
      const reqOptions = builder().withCookie('cookieName', 'cookieValue').options();
      expect(reqOptions.headers).to.contain.property('cookie', 'cookieName=cookieValue');
    })
  });


});