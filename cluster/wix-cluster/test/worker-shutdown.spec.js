'use strict';
const chai = require('chai'),
  should = require('chai').should(),
  sinonChai = require('sinon-chai'),
  sinon = require('sinon'),
  mochery = require('mockery');

chai.use(sinonChai);

describe('worker-shutdown', () => {
  let exit, origExit, origForceExitTimeout, clock, workerShutdown, cluster, wixClusterExchange, clusterShutdownChannel, otherChannel;

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

  it('should post worker-shutdown-gracefully on cluster-shutdown channel', () => {
    workerShutdown.shutdown();
    clusterShutdownChannel.send.should.be.calledOnce;
    otherChannel.send.should.not.be.called;
  });

  beforeEach(() => {
    cluster = {
      worker: {
        disconnect: sinon.spy(),
        id: -1
      }
    };
    clusterShutdownChannel = {
      send: sinon.spy()
    };
    otherChannel = {
      send: sinon.spy()
    };
    wixClusterExchange = {
      client: (channel) => {
        if (channel === 'cluster-shutdown') {
          return clusterShutdownChannel;
        }
        else {
          return otherChannel;
        }
      }
    };
    mochery.enable({useCleanCache:true});
    mochery.registerMock('cluster', cluster);
    mochery.registerMock('wix-cluster-exchange', wixClusterExchange);
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

