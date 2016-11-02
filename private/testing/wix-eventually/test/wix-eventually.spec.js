'use strict';
const retry = require('..'),
  expect = require('chai').use(require('chai-as-promised')).expect;

describe('wix-eventually', function() {
  this.timeout(20000);

  it('should retry 10 times with 1s delay by default and fail', () => {
    const before = Date.now();

    return Promise.resolve()
      .then(() => expect(retry(() => { throw new Error('nope') })).to.eventually.be.rejectedWith('Timeout of 10000 ms with: nope'))
      .then(() => expect(Date.now() - before).to.be.gt(9000).and.be.lt(11000));
  });

  it('should allow to set custom timeout', () => {
    const before = Date.now();

    return expect(retry(() => { throw new Error('nope') }, {timeout: 2000})).to.eventually.be.rejectedWith('Timeout of 2000 ms with: nope')
      .then(() => expect(Date.now() - before).to.be.gt(1500).and.be.lt(2500));
  });

  it('should pass-through succeeding promise', () => {
    return retry(() => Promise.resolve());
  });

  it('should pass-through succeeding function', () => {
    return retry(() => 'ok');
  });

  it('should eventually succeed', () => {
    let okToProceed = false;
    setTimeout(() => okToProceed = true, 2000);
    return retry(() => okToProceed === true ? Promise.resolve() : Promise.reject(new Error('nope')));
  });

  it('should be rejected with underlying error after timeout', () => {
    return expect(retry(() => { throw new Error('nope'); }, {timeout: 2000})).to.eventually.be.rejectedWith('Timeout of 2000 ms with: nope')
  });
});