'use strict';
const expect = require('chai').expect,
  uut = require('..'),
  sessionTestkitProvider = require('wix-session-crypto-testkit'),
  sessionCryptoProvider = require('wix-session-crypto'),
  stdTestkit = require('wix-stdouterr-testkit');

const builder = uut.builder;

describe('wix session aspect', () => {
  const interceptor = stdTestkit.interceptor().beforeAndAfterEach();

  it('should create empty aspect given no matching cookies were provided', () => {
    const aspect = buildAspect({});

    assertEmpty(aspect);
  });

  it('should use wixSession cookie if wixSession2 cookie is not available', () => {
    const bundle = sessionTestkitProvider.v1.aValidBundle();
    const aspect = buildAspect(bundle);

    assertMatches(aspect, bundle);
  });

  it('should use wixSession2 cookie if wixSession cookie is not available', () => {
    const bundle = sessionTestkitProvider.v2.aValidBundle();
    const aspect = buildAspect(bundle);

    assertMatches(aspect, bundle);
  });

  it('should use wixSession2 cookie if both wixSession and wixSession2 cookies are available and add both to cookies', () => {
    const bundleWixSession = sessionTestkitProvider.v1.aValidBundle();
    const bundleWixSession2 = sessionTestkitProvider.v2.aValidBundle();
    const aspect = buildAspect(bundleWixSession, bundleWixSession2);

    assertMatches(aspect, bundleWixSession2, bundleWixSession);
  });


  [sessionTestkitProvider.v1, sessionTestkitProvider.v2]
    .forEach(provider => {

      describe(provider.aValidBundle().cookieName, () => {

        it('should build an aspect from provided session cookie', () => {
          const bundle = provider.aValidBundle();
          const aspect = buildAspect(bundle);

          assertMatches(aspect, bundle);
        });

        it('should be a noop export', () => {
          const bundle = provider.aValidBundle();
          const aspect = buildAspect(bundle);

          expect(aspect.export()).to.deep.equal({});
        });

        it('should be a noop import', () => {
          const bundleInitial = provider.aValidBundle({session: {userGuid: '10', userName: '11'}});
          const bundleImport = provider.aValidBundle({session: {userGuid: '20', userName: '21'}});
          const aspect = buildAspect(bundleInitial);
          aspect.import(requestDataFrom([bundleImport]));

          assertMatches(aspect, bundleInitial);
        });

        it('should forbid modifications of nested objects', () => {
          const bundle = provider.aValidBundle();
          const aspect = buildAspect(bundle);

          expect(() => aspect.cookie.name = 'newName').to.throw();
          expect(() => aspect.colors.newKey = 'newName').to.throw();
        });
      });
    });

  describe('multiple session cookie error handling', () => {
    const wixSessionProvider = sessionTestkitProvider.v1;
    const wixSession2Provider = sessionTestkitProvider.v2;

    it('should not build aspect from wixSession cookie if expired wixSession2 cookie was present', () => {
      const wixSession = wixSessionProvider.aValidBundle();
      const wixSession2 = wixSession2Provider.anExpiredBundle();
      const aspect = buildAspect(wixSession, wixSession2);

      assertExpired(aspect, wixSession2, wixSession);
    });

    it('should not build aspect from wixSession cookie if malformed wixSession2 cookie was present', () => {
      const wixSession = wixSessionProvider.aValidBundle();
      const wixSession2 = wixSession2Provider.anExpiredBundle();
      wixSession2.token = 'abc';
      const aspect = buildAspect(wixSession, wixSession2);

      assertMalformed(aspect, wixSession2, wixSession);
    });
  });

  function buildAspect() {
    const bundleWixSession = sessionTestkitProvider.v1.aValidBundle();
    const bundleWixSession2 = sessionTestkitProvider.v2.aValidBundle();
    const cryptoV1 = sessionCryptoProvider.v1.get(bundleWixSession.mainKey);
    const cryptoV2 = sessionCryptoProvider.v2.get(bundleWixSession2.publicKey);
    return builder(
      token => cryptoV1.decrypt(token),
      token => cryptoV2.decrypt(token))(requestDataFrom(Array.prototype.slice.call(arguments)));
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

  function assertMatches(target, bundle, another) {
    expect(target.name).to.equal('session');
    expect(target.userGuid).to.equal(bundle.session.userGuid);
    expect(target.userName).to.equal(bundle.session.userName);
    expect(target.isWixStaff).to.equal(bundle.session.wixStaff);
    expect(target.userCreationDate.getTime()).to.equal(bundle.session.userCreationDate.getTime());
    expect(target.expiration.getTime()).to.equal(bundle.session.expiration.getTime());
    expect(target.colors).to.deep.equal(bundle.session.colors);
    expect(target.cookies).to.contain.deep.property(bundle.cookieName, bundle.token);

    if (another) {
      expect(target.cookies).to.contain.deep.property(another.cookieName, another.token);
    }
  }

  function assertExpired(target, bundle1, bundle2) {
    expect(target.userGuid).to.be.undefined;
    expect(target.error).to.be.instanceof(uut.errors.SessionExpiredError);
    expect(interceptor.stderr).to.be.string('failed populating session aspect with error:');
    expect(interceptor.stderr).to.be.string('SessionExpiredError');

    if (bundle1) {
      expect(target.cookies).to.contain.deep.property(bundle1.cookieName, bundle1.token);
    }

    if (bundle2) {
      expect(target.cookies).to.contain.deep.property(bundle2.cookieName, bundle2.token);
    }
  }

  function assertMalformed(target, bundle1, bundle2) {
    expect(target.userGuid).to.be.undefined;
    expect(target.error).to.be.instanceof(uut.errors.SessionMalformedError);
    expect(interceptor.stderr).to.be.string('failed populating session aspect with error:');
    expect(interceptor.stderr).to.be.string('SessionMalformedError');

    if (bundle1) {
      expect(target.cookies).to.contain.deep.property(bundle1.cookieName, bundle1.token);
    }

    if (bundle2) {
      expect(target.cookies).to.contain.deep.property(bundle2.cookieName, bundle2.token);
    }

  }

});

