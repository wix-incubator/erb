'use strict';
const expect = require('chai').expect,
  petri = require('..'),
  wixDomain = require('wix-domain'),
  uuid = require('uuid-support');

describe('wix petri', () => {
  let cookies;

  beforeEach(() => {
    delete wixDomain.get().petriCookies;
    cookies = {key1: uuid.generate(), key2: uuid.generate()};
  });

  it('should return an empty object if no petri cookies present', withinDomain(() => {
    expect(petri.get()).to.be.empty;
  }));


  it('should return an object with stored cookies', withinDomain(() => {
    petri.set(cookies);
    expect(cookies).to.deep.equal(petri.get());
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