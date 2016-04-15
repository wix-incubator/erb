'use strict';
const expect = require('chai').use(require('chai-things')).expect,
  plugin = require('../../lib/plugins/worker-notifier'),
  mocks = require('../support/mocks'),
  lolex = require('lolex');

describe('worker notifier plugin', () => {
  let clock;

  beforeEach(() => clock = lolex.install());
  afterEach(() => clock.uninstall());

  describe('worker', () => {

    it('sends memory stats to cluster master on fork', () => {
      const memoryUsage = {rss: 10, heapTotal: 11, heapUsed: 12};
      const worker = mocks.worker();
      const currentProcess = mocks.process(memoryUsage);

      plugin(currentProcess).onWorker(worker);

      expect(worker.receivedMessages().pop()).to.deep.equal({
        origin: 'wix-cluster',
        key: 'client-stats',
        value: memoryUsage
      });
    });

    it('sends memory stats to cluster master periodically', () => {
      const memoryUsage = {rss: 10, heapTotal: 11, heapUsed: 12};
      const worker = mocks.worker();
      const currentProcess = mocks.process(memoryUsage);

      plugin(currentProcess).onWorker(worker);

      expect(worker.receivedMessages().pop()).to.deep.equal({
        origin: 'wix-cluster',
        key: 'client-stats',
        value: memoryUsage
      });

      for (let i = 1; i <= 3; i++) {
        const newMemoryUsage = {rss: 10 * i, heapTotal: 10 * i, heapUsed: 10 * i};
        currentProcess.setMemoryUsage(newMemoryUsage);
        clock.tick(11000);

        expect(worker.receivedMessages().pop()).to.deep.equal({
          origin: 'wix-cluster',
          key: 'client-stats',
          value: newMemoryUsage
        });
      }
    });
  });

  describe('master', () => {

    it('sends worker count, death count and memory stats to a forked worker', () => {
      const worker = mocks.worker();
      const cluster = mocks.cluster([worker]);
      const currentProcess = mocks.process();

      plugin(currentProcess).onMaster(cluster);
      cluster.emit('listening', worker);

      expect(worker.receivedMessages()).to.contain.an.item.that.deep.equals({origin: 'wix-cluster', key: 'stats', value: {rss: 0, heapTotal: 0, heapUsed: 0}});
      expect(worker.receivedMessages()).to.contain.an.item.that.deep.equals({origin: 'wix-cluster', key: 'worker-count', value: 1});
      expect(worker.receivedMessages()).to.contain.an.item.that.deep.equals({origin: 'wix-cluster', key: 'death-count', value: 0});
    });

    it('broadcasts new worker death count to alive workers on worker disconnect', () => {
      const workerWillDie = mocks.worker({id: 1});
      const workerWillStayAlive = mocks.worker({id: 2});
      const cluster = mocks.cluster([workerWillDie, workerWillStayAlive]);
      const currentProcess = mocks.process();

      plugin(currentProcess).onMaster(cluster);
      cluster.emit('disconnect', workerWillDie);

      expect(workerWillStayAlive.receivedMessages()).to.contain.an.item.that.deep.equals({origin: 'wix-cluster', key: 'death-count', value: 1});
    });

    it('broadcasts aggregate memory stats periodically', () => {
      const workerOne = mocks.worker({id: 1});
      const workerTwo = mocks.worker({id: 2});
      const cluster = mocks.cluster([workerOne, workerTwo]);
      const currentProcess = mocks.process();

      const instance = plugin(currentProcess);

      instance.onMaster(cluster);
      cluster.emit('fork', workerOne);
      cluster.emit('fork', workerTwo);

      workerOne.emit('message', { origin: 'wix-cluster', key: 'client-stats', value: {rss: 10, heapTotal: 11, heapUsed: 12}});
      clock.tick(11000);
      expect(workerOne.receivedMessages().pop()).to.deep.equal({origin: 'wix-cluster', key: 'stats', value: {rss: 10, heapTotal: 11, heapUsed: 12}});
      expect(workerTwo.receivedMessages().pop()).to.deep.equal({origin: 'wix-cluster', key: 'stats', value: {rss: 10, heapTotal: 11, heapUsed: 12}});

      workerTwo.emit('message', { origin: 'wix-cluster', key: 'client-stats', value: {rss: 20, heapTotal: 21, heapUsed: 22}});
      clock.tick(11000);
      expect(workerOne.receivedMessages().pop()).to.deep.equal({origin: 'wix-cluster', key: 'stats', value: {rss: 30, heapTotal: 32, heapUsed: 34}});
      expect(workerTwo.receivedMessages().pop()).to.deep.equal({origin: 'wix-cluster', key: 'stats', value: {rss: 30, heapTotal: 32, heapUsed: 34}});
    });

    it('removes workers memory stats from broadcasted stats upon worker disconnect', () => {
      const workerOne = mocks.worker({id: 1});
      const workerTwo = mocks.worker({id: 2});
      const cluster = mocks.cluster([workerOne, workerTwo]);
      const currentProcess = mocks.process();

      const instance = plugin(currentProcess);

      instance.onMaster(cluster);

      cluster.emit('fork', workerOne);
      workerOne.emit('message', { origin: 'wix-cluster', key: 'client-stats', value: {rss: 10, heapTotal: 11, heapUsed: 12}});

      cluster.emit('fork', workerTwo);
      workerTwo.emit('message', { origin: 'wix-cluster', key: 'client-stats', value: {rss: 10, heapTotal: 11, heapUsed: 12}});

      clock.tick(11000);
      expect(workerOne.receivedMessages().pop()).to.deep.equal({origin: 'wix-cluster', key: 'stats', value: {rss: 20, heapTotal: 22, heapUsed: 24}});
      expect(workerTwo.receivedMessages().pop()).to.deep.equal({origin: 'wix-cluster', key: 'stats', value: {rss: 20, heapTotal: 22, heapUsed: 24}});

      cluster.emit('disconnect', workerOne);
      
      expect(workerOne.receivedMessages().pop()).to.deep.equal({origin: 'wix-cluster', key: 'stats', value: {rss: 10, heapTotal: 11, heapUsed: 12}});
    });

  });
});