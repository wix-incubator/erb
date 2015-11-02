'use strict';
const expect = require('chai').expect,
  petri = require('..'),
  wixDomain = require('wix-domain'),
  uuid = require('uuid-support');

describe('wix petri', () => {
  let cookies;

  beforeEach(() => {
    delete wixDomain.get().petriCookies;
    cookies = [uuid.generate(), uuid.generate()];
  });

  it('should return an empty array if no petri cookies present', withinDomain(() => {
    expect(petri.get()).to.be.empty;
  }));


  it('should return a list of stored cookies', withinDomain(() => {
    petri.set(cookies);
    expect(cookies).to.deep.equal(petri.get());
  }));

  it('should not allow to overwrite petri cookies if they are already present in domain', withinDomain(() => {
    petri.set(cookies);
    petri.set([uuid.generate()]);
    expect(cookies).to.deep.equal(petri.get());
  }));

  it('should not allow to modify returned cookies', withinDomain(() => {
    petri.set(cookies);
    expect(() => petri.get()[0] = uuid.generate()).to.throw(TypeError);
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