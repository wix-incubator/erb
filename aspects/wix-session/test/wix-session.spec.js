'use strict';
const expect = require('chai').expect,
  wixSession = require('..'),
  wixDomain = require('wix-domain'),
  uuid = require('uuid-support');


describe('wix session', () => {
  let session;

  beforeEach(() => {
    delete wixDomain.get().wixSession;
    session = aSession();
  });

  it('should return undefined if session is not set', withinDomain(() => {
    expect(wixSession.get()).to.be.undefined;
  }));

  it('should return a stored session object', withinDomain(() => {
    wixSession.set(session);
    expect(wixSession.get()).to.deep.equal(session);
  }));

  it('should not allow to overwrite session if it is already present in domain', withinDomain(() => {
    wixSession.set(session);
    wixSession.set(aSession());
    expect(wixSession.get()).to.deep.equal(session);
  }));

  it('should not allow to modify returned session', withinDomain(() => {
    wixSession.set(session);
    expect(() => wixSession.get().userGuid = uuid.generate()).to.throw(TypeError);
  }));
});

function withinDomain(fn) {
  return done => {
    wixDomain.get().run(() => {
      fn();
      done();
    });
  };
}

function aSession() {
  return {
    userGuid: uuid.generate()
  };
}