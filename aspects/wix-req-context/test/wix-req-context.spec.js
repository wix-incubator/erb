'use strict';
const expect = require('chai').expect,
  reqContext = require('..'),
  wixDomain = require('wix-domain'),
  uuid = require('uuid-support');


describe('wix request context', () => {
  let ctx;

  beforeEach(() => {
    delete wixDomain.get().reqContext;
    ctx = randomContext();
  });

  it('should return an empty object if request context is not set', withinDomain(() => {
    expect(reqContext.get()).to.deep.equal({});
  }));

  it('should return a stored request context', withinDomain(() => {
    reqContext.set(ctx);
    expect(reqContext.get()).to.deep.equal(ctx);
  }));

  it('should not allow to overwrite request context if it is already present in domain', withinDomain(() => {
    reqContext.set(ctx);
    reqContext.set(randomContext());
    expect(reqContext.get()).to.deep.equal(ctx);
  }));

  it('should not allow to modify returned request context', withinDomain(() => {
    reqContext.set(ctx);
    expect(() => reqContext.get().requestId = uuid.generate()).to.throw(TypeError);
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

function randomContext() {
  return {
    requestId: uuid.generate()
  };
}