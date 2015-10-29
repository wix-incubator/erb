'use strict';
const expect = require('chai').expect,
  wixDomain = require('..');

describe('wix-domain', () => {
  it('should allow to retrieve stored data', done => {
    let current = wixDomain.get();
    current.someKey = 'someValue';
    current.run(() => {
      expect(wixDomain.get().someKey).to.equal('someValue');
      done();
    });
  });
});