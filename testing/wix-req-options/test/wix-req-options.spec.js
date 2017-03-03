const builder = require('..').builder,
  expect = require('chai').use(require('./matchers')).expect,
  cookieUtils = require('cookie-utils'),
  chance = require('chance')(),
  testkit = require('wix-session-crypto-testkit'),
  NodeRSA = require('node-rsa');

describe('wix req options', () => {

  it('should add web-context related headers by default', () => {
    const options = builder().options();
    expect(options).to.be.likeObject({
      headers: {
        'x-wix-default_port': '2222',
        'x-wix-ip': '1.1.1.1',
        'x-wix-forwarded-url': 'http://www.kfir.com',
        'x-wix-language': 'pt',
        'x-wix-country-code': 'BR'
      }
    });
    expect(options).to.contain.deep.property('headers.x-wix-request-id').that.is.validGuid();
  });

  it('should not add web-context related headers', () => {
    const options = builder(false).options();
    expect(options).to.deep.equal({
      headers: {}
    });
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
      const {privateKey, publicKey} = keyPair();
      const bundle = testkit.aValidBundle({privateKey, publicKey});

      const reqOptions = builder().withSession(bundle);
      const options = reqOptions.options();

      expect(reqOptions.wixSession.publicKey).to.equal(publicKey);
      expect(options.headers.cookie).to.be.string(`${reqOptions.wixSession.cookieName}=${reqOptions.wixSession.token}`);
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

  function keyPair() {
    const key = new NodeRSA({b: 512});

    return {
      privateKey: key.exportKey('private'),
      publicKey: key.exportKey('public')
    };
  }

});
