'use strict';
const chai = require('chai'),
  should = require('chai').should(),
  sinonChai = require('sinon-chai'),
  sinon = require('sinon'),
  mochery = require('mockery');

chai.use(sinonChai);

describe('worker-shutdown', () => {
  let exit, origExit, origForceExitTimeout, clock, workerShutdown, cluster;

  it('should call exit within designated timeout', () => {
    workerShutdown.shutdown();
    clock.tick(100);
    exit.should.be.calledOnce;
  });

  it('should call close on all registered resources', () => {
    let resource = {
      close: sinon.spy()
    };
    workerShutdown.addResourceToClose(resource);

    workerShutdown.shutdown();

    resource.close.should.be.calledOnce;
  });

  it('should call disconnect on cluster worker', () => {
    workerShutdown.shutdown();
    cluster.worker.disconnect.should.be.calledOnce;
  });

  beforeEach(() => {
    cluster = {
      worker: {
        disconnect: sinon.spy()
      }
    };
    mochery.enable({useCleanCache:true});
    mochery.registerMock('cluster', cluster);
    mochery.registerAllowable('../lib/worker-shutdown');
    workerShutdown = require('../lib/worker-shutdown');
    exit = sinon.spy();
    origExit = workerShutdown.exit;
    origForceExitTimeout = workerShutdown.forceExitTimeout;
    workerShutdown.forceExitTimeout = 10;
    workerShutdown.exit = exit;

    clock = sinon.useFakeTimers();

  });

  afterEach(() => {
    workerShutdown.exit = origExit;
    workerShutdown.forceExitTimeout = origForceExitTimeout;
    clock.restore();
    mochery.resetCache();
    mochery.deregisterAll();
    mochery.disable();
  });


});

