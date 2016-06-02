'use strict';
const expect = require('chai').expect,
  builder = require('..'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  sessionCrypto = require('wix-session-crypto').v1,
  stdTestkit = require('wix-stdouterr-testkit');

describe('wix session aspect', () => {
  const interceptor = stdTestkit.interceptor().beforeAndAfterEach();

  describe('builder', () => {
    it('should support builder from mainKey', () => {
      const bundle = sessionTestkit.aValidBundle();
      const instance = builder.builder(bundle.mainKey);

      expect(instance(requestDataFrom(bundle)).userGuid).to.equal(bundle.session.userGuid);
    });

    it('should support builder using sessionCrypto instance', () => {
      const bundle = sessionTestkit.aValidBundle();
      const instance = builder.builder(sessionCrypto.get(bundle.mainKey));

      expect(instance(requestDataFrom(bundle)).userGuid).to.equal(bundle.session.userGuid);
    });

  });

  it('should create empty aspect given no matching cookies were provided', () => {
    const bundle = sessionTestkit.aValidBundle();
    const aspect = builder.builder(bundle.mainKey)({});
    expect(aspect.userGuid).to.be.undefined;
  });

  it('should build an aspect from provided session cookie', () => {
    const bundle = sessionTestkit.aValidBundle();
    const aspect = builder.builder(bundle.mainKey)(requestDataFrom(bundle));

    expect(aspect.name).to.equal('session');
    expect(aspect.userGuid).to.equal(bundle.session.userGuid);
    expect(aspect.isWixStaff).to.equal(bundle.session.wixStaff);
    expect(aspect.userCreationDate.getTime()).to.equal(bundle.session.userCreationDate.getTime());
    expect(aspect.expiration.getTime()).to.equal(bundle.session.expiration.getTime());
    expect(aspect.colors).to.deep.equal(bundle.session.colors);
    expect(aspect.cookie).to.deep.equal({
      name: bundle.cookieName,
      value: bundle.token
    });
  });

  it('should build empty aspect for an expired session and log error', () => {
    const bundle = sessionTestkit.anExpiredBundle();
    const aspect = builder.builder(bundle.mainKey)(requestDataFrom(bundle));

    expect(aspect.userGuid).to.be.undefined;
    expect(interceptor.stderr).to.be.string('received expired \'wixSession\' cookie, not populating session aspect');
  });

  it('should build empty aspect for a malformed session and log error', () => {
    const bundle = sessionTestkit.anExpiredBundle();
    bundle.token = 'abc';
    const aspect = builder.builder(bundle.mainKey)(requestDataFrom(bundle));

    expect(aspect.userGuid).to.be.undefined;
    expect(interceptor.stderr).to.be.string('received malformed \'wixSession\' cookie, not populating session aspect');
  });

  it('should be a noop export', () => {
    const bundle = sessionTestkit.aValidBundle();
    const aspect = builder.builder(bundle.mainKey)(requestDataFrom(bundle));

    expect(aspect.export()).to.deep.equal({});
  });

  it('should be a noop import', () => {
    const bundleInitial = sessionTestkit.aValidBundle({session: {userGuid: 10}});
    const bundleImport = sessionTestkit.aValidBundle({mainKey: bundleInitial.mainKey, session: {userGuid: 20}});
    const aspect = builder.builder(bundleInitial.mainKey)(requestDataFrom(bundleInitial));
    aspect.import(requestDataFrom(bundleImport));

    expect(aspect.userGuid).to.equal('10');
  });


  it('should forbid modifications of nested objects', () => {
    const bundle = sessionTestkit.aValidBundle();
    const aspect = builder.builder(bundle.mainKey)(requestDataFrom(bundle));

    expect(() => aspect.cookie.name = 'newName').to.throw();
    expect(() => aspect.colors.newKey = 'newName').to.throw();
  });

  function requestDataFrom(bundle) {
    const data = {cookies: {}};
    data.cookies[bundle.cookieName] = bundle.token;
    return data;
  }
});