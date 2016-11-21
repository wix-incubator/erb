'use strict';
const expect = require('chai').use(require('chai-things')).expect,
  plugin = require('../../lib/plugins/worker-notifier'),
  mocks = require('../support/mocks'),
  lolex = require('lolex'),
  log = require('wnp-debug')('for-tests');

describe('worker notifier plugin', () => {
  let clock;

  beforeEach(() => clock = lolex.install());
  afterEach(() => clock.uninstall());

  describe('master', () => {

    it('sends worker count, death count to a forked worker', () => {
      const worker = mocks.worker();
      const cluster = mocks.cluster([worker]);

      plugin.master({log, statsRefreshInterval: 1000})(cluster);
      cluster.emit('listening', worker);

      expect(worker.receivedMessages()).to.contain.an.item.that.deep.equals({origin: 'wix-cluster', key: 'worker-count', value: 1});
      expect(worker.receivedMessages()).to.contain.an.item.that.deep.equals({origin: 'wix-cluster', key: 'death-count', value: 0});
    });

    it('broadcasts new worker death count to alive workers on worker disconnect', () => {
      const workerWillDie = mocks.worker({id: 1});
      const workerWillStayAlive = mocks.worker({id: 2});
      const cluster = mocks.cluster([workerWillDie, workerWillStayAlive]);

      plugin.master({log, statsRefreshInterval: 1000})(cluster);
      cluster.emit('disconnect', workerWillDie);

      expect(workerWillStayAlive.receivedMessages()).to.contain.an.item.that.deep.equals({origin: 'wix-cluster', key: 'death-count', value: 1});
    });

    it('broadcast messages from worker to all workers', () => {
      const workerOne = mocks.worker({id: 1});
      const workerTwo = mocks.worker({id: 2});
      const cluster = mocks.cluster([workerOne, workerTwo]);

      plugin.master({log, statsRefreshInterval: 1000})(cluster);

      cluster.emit('fork', workerOne);
      cluster.emit('fork', workerTwo);

      workerOne.process.send({ origin: 'wix-cluster', key: 'broadcast', value: {key: 'aKey', value: 'forAll'}});

      expect(workerOne.receivedMessages().pop()).to.deep.equal({ origin: 'wix-cluster', key: 'broadcast', value: {key: 'aKey', value: 'forAll'}});
      expect(workerTwo.receivedMessages().pop()).to.deep.equal({ origin: 'wix-cluster', key: 'broadcast', value: {key: 'aKey', value: 'forAll'}});
    });
  });
});
