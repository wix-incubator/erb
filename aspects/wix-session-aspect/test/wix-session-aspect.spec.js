const expect = require('chai').expect,
  uut = require('..'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  {WixSessionCrypto} = require('wix-session-crypto'),
  stdTestkit = require('wix-stdouterr-testkit');

const builder = uut.builder;

describe('wix session aspect', () => {
  const interceptor = stdTestkit.interceptor().beforeAndAfterEach();

  it('should create empty aspect given no matching cookies were provided', () => {
    const aspect = buildAspect({});

    assertEmpty(aspect);
  });

  it('should build an aspect from provided session cookie', () => {
    const bundle = sessionTestkit.aValidBundle();
    const aspect = buildAspect(bundle);

    assertMatches(aspect, bundle);
  });

  it('should be a noop export', () => {
    const bundle = sessionTestkit.aValidBundle();
    const aspect = buildAspect(bundle);

    expect(aspect.export()).to.deep.equal({});
  });

  it('should be a noop import', () => {
    const bundleInitial = sessionTestkit.aValidBundle({session: {userGuid: '10', userName: '11'}});
    const bundleImport = sessionTestkit.aValidBundle({session: {userGuid: '20', userName: '21'}});
    const aspect = buildAspect(bundleInitial);
    aspect.import(requestDataFrom([bundleImport]));

    assertMatches(aspect, bundleInitial);
  });

  it('should forbid modifications of nested objects', () => {
    const bundle = sessionTestkit.aValidBundle();
    const aspect = buildAspect(bundle);

    expect(() => aspect.cookie.name = 'newName').to.throw();
    expect(() => aspect.colors.newKey = 'newName').to.throw();
  });

  describe('multiple session cookie error handling', () => {

    it('should not build aspect if expired wixSession2 cookie was present', () => {
      const wixSession2 = sessionTestkit.anExpiredBundle();
      const aspect = buildAspect(wixSession2);

      assertExpired(aspect, wixSession2);
    });

    it('should not build aspect if malformed wixSession2 cookie was present', () => {
      const wixSession2 = sessionTestkit.anExpiredBundle();
      wixSession2.token = 'abc';
      const aspect = buildAspect(wixSession2);

      assertMalformed(aspect, wixSession2);
    });
  });

  function buildAspect() {
    const sessionBundle = sessionTestkit.aValidBundle();
    const cryptoV2 = new WixSessionCrypto(sessionBundle.publicKey);
    return builder(token => cryptoV2.decrypt(token))(requestDataFrom(Array.prototype.slice.call(arguments)));
  }

  function requestDataFrom(bundles) {
    const data = {cookies: {}};
    bundles.forEach(bundle => data.cookies[bundle.cookieName] = bundle.token);
    return data;
  }

  function assertEmpty(target) {
    expect(target.userGuid).to.be.undefined;
    expect(target.error).to.be.undefined;
    expect(target.cookies).to.deep.equal({});
  }

  function assertMatches(target, bundle) {
    expect(target.name).to.equal('session');
    expect(target.userGuid).to.equal(bundle.session.userGuid);
    expect(target.userName).to.equal(bundle.session.userName);
    expect(target.isWixStaff).to.equal(bundle.session.wixStaff);
    expect(target.userCreationDate.getTime()).to.equal(bundle.session.userCreationDate.getTime());
    expect(target.expiration.getTime()).to.equal(bundle.session.expiration.getTime());
    expect(target.colors).to.deep.equal(bundle.session.colors);
    expect(target.lastValidationTime.getTime()).to.equal(bundle.session.lastValidationTime.getTime());
    expect(target.cookies).to.contain.deep.property(bundle.cookieName, bundle.token);
  }

  function assertExpired(target, bundle) {
    expect(target.userGuid).to.be.undefined;
    expect(target.error).to.be.instanceof(uut.errors.SessionExpiredError);
    expect(interceptor.stderr).to.be.string('failed populating session aspect with error:');
    expect(interceptor.stderr).to.be.string('SessionExpiredError');

    if (bundle) {
      expect(target.cookies).to.contain.deep.property(bundle.cookieName, bundle.token);
    }
  }

  function assertMalformed(target, bundle) {
    expect(target.userGuid).to.be.undefined;
    expect(target.error).to.be.instanceof(uut.errors.SessionMalformedError);
    expect(interceptor.stderr).to.be.string('failed populating session aspect with error:');
    expect(interceptor.stderr).to.be.string('SessionMalformedError');

    if (bundle) {
      expect(target.cookies).to.contain.deep.property(bundle.cookieName, bundle.token);
    }
  }

});

