'use strict';
const expect = require('chai').expect,
  builder = require('..'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  sessionCrypto = require('wix-session-crypto');

describe('wix session aspect', () => {

  describe('builder', () => {
    it('should support builder from mainKey/alternateKey', () => {
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
    expect(aspect.uid).to.equal(bundle.session.uid);
    expect(aspect.mailStatus).to.equal(bundle.session.mailStatus);
    expect(aspect.isWixStaff).to.equal(bundle.session.isWixStaff);
    expect(aspect.userCreationDate.getTime()).to.equal(bundle.session.userCreationDate.getTime());
    expect(aspect.expiration.getTime()).to.equal(bundle.session.expiration.getTime());
    expect(aspect.colors).to.deep.equal(bundle.session.colors);
    expect(aspect.permissions).to.equal(bundle.session.permissions);
    expect(aspect.cookie).to.deep.equal({
      name: bundle.cookieName,
      value: bundle.token
    });
  });

  it('should build empty aspect for an expired session', () => {
    const bundle = sessionTestkit.anExpiredBundle();
    const aspect = builder.builder(bundle.mainKey)(requestDataFrom(bundle));
    expect(aspect.userGuid).to.be.undefined;
  });

  it('should be a noop export', () => {
    const bundle = sessionTestkit.aValidBundle();
    const aspect = builder.builder(bundle.mainKey)(requestDataFrom(bundle));

    expect(aspect.export()).to.deep.equal({});
  });

  it('should be a noop import', () => {
    const bundleInitial = sessionTestkit.aValidBundle({session: {uid: 10}});
    const bundleImport = sessionTestkit.aValidBundle({mainKey: bundleInitial.mainKey, session: {uid: 20}});
    const aspect = builder.builder(bundleInitial.mainKey)(requestDataFrom(bundleInitial));
    aspect.import(requestDataFrom(bundleImport));

    expect(aspect.uid).to.equal(10);
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