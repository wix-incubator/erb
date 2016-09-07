'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  run = require('../lib/app-runner');

describe('app-runner', () => {
  const stopFn = () => 'ok';

  it('should run the app function and return a resolved promise', () =>
    expect(run(() => 'ok')).to.eventually.to.equal('ok')
  );

  it('should run the thenable function and return a resolved promise', () =>
    expect(run(() => Promise.resolve('ok'))).to.eventually.equal('ok')
  );

  it('should run the app function and return a rejected promise given app failed', () =>
    expect(run(() => { throw new Error('woops')})).to.be.rejectedWith('woops')
  );

  it('should run the thenable function and return a rejected promise given app failed', () =>
    expect(run(() => Promise.reject(new Error('woops')))).to.be.rejectedWith('woops')
  );

  it('should return a resolved promise and assign result to provided reference', () => {
    let assignedStopFn;
    let ref = stop => assignedStopFn = stop;
    return expect(run(() => stopFn, ref)).to.eventually.equal(stopFn)
      .then(() => expect(assignedStopFn).to.equal(stopFn));
  });

  it('should return a resolved promise and assign result to provided reference', () => {
    let assignedStopFn;
    let ref = stop => assignedStopFn = stop;
    return expect(run(() => Promise.resolve(stopFn), ref)).to.eventually.equal(stopFn)
      .then(() => expect(assignedStopFn).to.equal(stopFn));
  });

  it('should a noop function to provided reference if promise returns not a function', () => {
    let assignedStopFn;
    let ref = stop => assignedStopFn = stop;
    return expect(run(() => 'ok', ref)).to.eventually.equal('ok')
      .then(() => expect(assignedStopFn).to.be.instanceof(Function));
  });

});