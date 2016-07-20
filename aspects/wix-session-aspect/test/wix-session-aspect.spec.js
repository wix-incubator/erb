'use strict';
const expect = require('chai').expect,
  builder = require('..'),
  sessionTestkitProvider = require('wix-session-crypto-testkit'),
  sessionCryptoProvider = require('wix-session-crypto'),
  stdTestkit = require('wix-stdouterr-testkit');

describe('wix session aspect', () => {
  const interceptor = stdTestkit.interceptor().beforeAndAfterEach();

  it('should create empty aspect given no matching cookies were provided', () => {
    const aspect = buildAspect({});
    expect(aspect.userGuid).to.be.undefined;
    expect(aspect.cookies).to.deep.equal({});
  });

  it('should use wixSession cookie if wixSession2 cookie is not available', () => {
    const bundle = sessionTestkitProvider.v1.aValidBundle();
    const aspect = buildAspect(bundle);

    expect(aspect.userGuid).to.equal(bundle.session.userGuid);
    expect(aspect.cookies).to.contain.deep.property('wixSession');
    expect(aspect.cookies).to.contain.deep.property(bundle.cookieName, bundle.token);
  });

  it('should use wixSession2 cookie if wixSession cookie is not available', () => {
    const bundle = sessionTestkitProvider.v2.aValidBundle();
    const aspect = buildAspect(bundle);

    expect(aspect.userGuid).to.equal(bundle.session.userGuid);
    expect(aspect.cookies).to.contain.deep.property('wixSession2');
    expect(aspect.cookies).to.contain.deep.property(bundle.cookieName, bundle.token);
  });

  it('should use wixSession2 cookie if both wixSession and wixSession2 cookies are available but add both to cookies', () => {
    const bundleWixSession = sessionTestkitProvider.v1.aValidBundle();
    const bundleWixSession2 = sessionTestkitProvider.v2.aValidBundle();
    const aspect = buildAspect(bundleWixSession, bundleWixSession2);

    expect(aspect.userGuid).to.equal(bundleWixSession2.session.userGuid);
    expect(aspect.cookies).to.contain.deep.property(bundleWixSession2.cookieName, bundleWixSession2.token);
    expect(aspect.cookies).to.contain.deep.property(bundleWixSession.cookieName, bundleWixSession.token);
  });


  [sessionTestkitProvider.v1, sessionTestkitProvider.v2]
    .forEach(provider => {

      describe(provider.aValidBundle().cookieName, () => {

        it('should build an aspect from provided session cookie', () => {
          const bundle = provider.aValidBundle();
          const aspect = buildAspect(bundle);

          expect(aspect.name).to.equal('session');
          expect(aspect.userGuid).to.equal(bundle.session.userGuid);
          expect(aspect.isWixStaff).to.equal(bundle.session.wixStaff);
          expect(aspect.userCreationDate.getTime()).to.equal(bundle.session.userCreationDate.getTime());
          expect(aspect.expiration.getTime()).to.equal(bundle.session.expiration.getTime());
          expect(aspect.colors).to.deep.equal(bundle.session.colors);
          expect(aspect.cookies).to.contain.deep.property(bundle.cookieName, bundle.token);
        });

        it('should be a noop export', () => {
          const bundle = provider.aValidBundle();
          const aspect = buildAspect(bundle);

          expect(aspect.export()).to.deep.equal({});
        });

        it('should be a noop import', () => {
          const bundleInitial = provider.aValidBundle({session: {userGuid: '10'}});
          const bundleImport = provider.aValidBundle({session: {userGuid: '20'}});
          const aspect = buildAspect(bundleInitial);
          aspect.import(requestDataFrom([bundleImport]));

          expect(aspect.userGuid).to.equal('10');
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

    it('should build empty aspect if both session cookies have expired and log errors', () => {
      const wixSession = wixSessionProvider.anExpiredBundle();
      const wixSession2 = wixSession2Provider.anExpiredBundle();
      const aspect = buildAspect(wixSession, wixSession2);

      expect(aspect.userGuid).to.be.undefined;
      expect(interceptor.stderr).to.be.string('failed populating session aspect with errors:');
      expect(interceptor.stderr).to.be.string(`received expired '${wixSession.cookieName}' cookie '${wixSession.token}'`);
      expect(interceptor.stderr).to.be.string(`received expired '${wixSession2.cookieName}' cookie '${wixSession2.token}'`);
    });

    it('should build aspect from wixSession cookie if wixSession2 cookie has expired', () => {
      const wixSession = wixSessionProvider.aValidBundle();
      const wixSession2 = wixSession2Provider.anExpiredBundle();
      const aspect = buildAspect(wixSession, wixSession2);


      expect(aspect.userGuid).to.equal(wixSession.session.userGuid);
      expect(interceptor.stderr).to.not.be.string('failed populating session aspect with errors:');
      expect(interceptor.stderr).to.be.string('session aspect populated, but encountered errors:');
      expect(interceptor.stderr).to.be.string(`received expired '${wixSession2.cookieName}' cookie '${wixSession2.token}'`);
    });

    it('should build aspect from wixSession2 cookie if wixSession cookie has expired', () => {
      const wixSession = wixSessionProvider.anExpiredBundle();
      const wixSession2 = wixSession2Provider.aValidBundle();
      const aspect = buildAspect(wixSession, wixSession2);

      expect(aspect.userGuid).to.equal(wixSession2.session.userGuid);
      expect(interceptor.stderr).to.not.be.string('failed populating session aspect with errors:');
      expect(interceptor.stderr).not.be.string('session aspect populated, but encountered errors:');
    });

    it('should build empty aspect if both session cookies are malformed', () => {
      const wixSession = wixSessionProvider.aValidBundle();
      wixSession.token = 'qwe';
      const wixSession2 = wixSession2Provider.aValidBundle();
      wixSession2.token = 'abc';
      const aspect = buildAspect(wixSession, wixSession2);

      expect(aspect.userGuid).to.be.undefined;
      expect(interceptor.stderr).to.be.string('failed populating session aspect with errors:');
      expect(interceptor.stderr).to.be.string(`received malformed '${wixSession.cookieName}' cookie '${wixSession.token}'`);
      expect(interceptor.stderr).to.be.string(`received malformed '${wixSession.cookieName}' cookie '${wixSession.token}'`);
    });

    it('should build aspect from wixSession cookie if wixSession2 cookie is malformed', () => {
      const wixSession = wixSessionProvider.aValidBundle();
      const wixSession2 = wixSession2Provider.anExpiredBundle();
      wixSession2.token = 'mlfrmd';
      const aspect = buildAspect(wixSession, wixSession2);

      expect(aspect.userGuid).to.equal(wixSession.session.userGuid);
      expect(interceptor.stderr).to.not.be.string('failed populating session aspect with errors:');
      expect(interceptor.stderr).to.be.string('session aspect populated, but encountered errors:');
      expect(interceptor.stderr).to.be.string(`received malformed '${wixSession2.cookieName}' cookie '${wixSession2.token}'`);
    });

    it('should build aspect from wixSession2 cookie if wixSession cookie is malformed', () => {
      const wixSession = wixSessionProvider.anExpiredBundle();
      wixSession.token = 'mlfrmd';
      const wixSession2 = wixSession2Provider.aValidBundle();
      const aspect = buildAspect(wixSession, wixSession2);

      expect(aspect.userGuid).to.equal(wixSession2.session.userGuid);
      expect(interceptor.stderr).to.not.be.string('failed populating session aspect with errors:');
      expect(interceptor.stderr).not.be.string('session aspect populated, but encountered errors:');
    });
  });

  function buildAspect() {
    const bundleWixSession = sessionTestkitProvider.v1.aValidBundle();
    const bundleWixSession2 = sessionTestkitProvider.v2.aValidBundle();
    const cryptoV1 = sessionCryptoProvider.v1.get(bundleWixSession.mainKey);
    const cryptoV2 = sessionCryptoProvider.v2.get(bundleWixSession2.publicKey);
    return builder.builder(
      token => cryptoV1.decrypt(token),
      token => cryptoV2.decrypt(token))(requestDataFrom(Array.prototype.slice.call(arguments)));
  }

  function requestDataFrom(bundles) {
    const data = {cookies: {}};
    bundles.forEach(bundle => data.cookies[bundle.cookieName] = bundle.token);
    return data;
  }
});