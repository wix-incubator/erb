'use strict';
const expect = require('chai').use(require('sinon-chai')).use(require('chai-as-promised')).expect,
  sinon = require('sinon'),
  wixCluster = require('wix-new-cluster'),
  runner = require('..'),
  _ = require('lodash');

describe('runner', () => {
  const match = sinon.match;

  it('runs function via wix-cluster and returns resolved promise', sinon.test(function() {
    this.stub(wixCluster, 'run')
      .withArgs(match.func, undefined)
      .returns(Promise.resolve('done'));

    return runner()(() => 'done').then(res => expect(res).to.equal('done'));
  }));

  it('should return a failed promise given runnable fails', sinon.test(function() {
    this.stub(wixCluster, 'run')
      .withArgs(match.func, undefined)
      .returns(Promise.reject(Error('woop')));

    return expect(runner()(_.noop)).to.eventually.be.rejectedWith('woop');
  }));

  it('should pass-on opts to a wix-cluster run function', sinon.test(function() {
    const opts = {forCluster: true};
    this.mock(wixCluster)
      .expects('run')
      .withArgs(match.func, opts)
      .once();

    return runner(opts)(_.noop);
  }));
});
