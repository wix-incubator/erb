'use strict';
const expect = require('chai').expect,
  wixBi = require('../index'),
  wixDomain = require('wix-domain'),
  chance = require('chance')();

describe('wix bi', ()=> {

  const aBiData = () => {
    return {
      cidx: chance.guid(),
      uidx: chance.guid(),
      globalSessionId: chance.guid()
    };
  };

  beforeEach(() => delete wixDomain.get().biData);

  it('should insert and get', withinDomain(() => {
    const biData = aBiData();
    wixBi.set(biData);
    expect(wixBi.get()).to.deep.equal(biData);
  }));

  it('should return empty object on get without set', withinDomain(() => {
    expect(wixBi.get()).to.deep.equal({});
  }));


});
// todo - code duplication from wix-petri
function withinDomain(fn) {
  return done => {
    wixDomain.get().run(() => {
      fn();
      done();
    });
  };
}