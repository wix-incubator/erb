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

        it('should build empty aspect for an expired session and log error', () => {
          const bundle = provider.anExpiredBundle();
          const aspect = buildAspect(bundle);

          expect(aspect.userGuid).to.be.undefined;
          expect(interceptor.stderr).to.be.string(`received expired '${bundle.cookieName}' cookie, not populating session aspect`);
        });

        it('should build empty aspect for a malformed session and log error', () => {
          const bundle = provider.aValidBundle();
          bundle.token = 'abc';
          const aspect = buildAspect(bundle);

          expect(aspect.userGuid).to.be.undefined;
          expect(interceptor.stderr).to.be.string(`received malformed '${bundle.cookieName}' cookie, not populating session aspect`);
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