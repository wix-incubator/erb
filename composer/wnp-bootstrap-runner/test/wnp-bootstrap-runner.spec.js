'use strict';
const chai = require('chai'),
  expect = chai.expect,
  sinonJs = require('sinon'),
  wixCluster = require('wix-cluster'),
  runner = require('..'),
  _ = require('lodash');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('runner', () => {
  let sinon;
  const match = sinonJs.match;

  beforeEach(() => sinon = sinonJs.sandbox.create());
  afterEach(() => sinon.verifyAndRestore());

  it('runs function via wix-cluster and returns resolved promise', () => {
    sinon.stub(wixCluster, 'run')
      .withArgs(match.func, undefined)
      .returns(Promise.resolve('done'));

    return runner()(() => 'done').then(res => expect(res).to.equal('done'));
  });

  it('should return a failed promise given runnable fails', () => {
    sinon.stub(wixCluster, 'run')
      .withArgs(match.func, undefined)
      .returns(Promise.reject(Error('woop')));

    return expect(runner()(_.noop)).to.eventually.be.rejectedWith('woop');
  });

  it('should pass-on opts to a wix-cluster run function', () => {
    const opts = {forCluster: true};
    sinon.mock(wixCluster)
      .expects('run')
      .withArgs(match.func, opts)
      .once();

    return runner(opts)(_.noop);
  });
});