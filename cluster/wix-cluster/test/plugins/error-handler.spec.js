'use strict';
const expect = require('chai').expect,
  lolex = require('lolex'),
  plugin = require('../../lib/plugins/error-handler'),
  mocks = require('../support/mocks'),
  testkit = require('wix-stdouterr-testkit');

describe('error handler plugin', () => {
  const logTestkit = testkit.interceptor().beforeAndAfterEach();

  let clock;

  beforeEach(() => clock = lolex.install());
  afterEach(() => clock.uninstall());

    it('kills a worker if it is still alive after predefined timeout', () => {
      const worker = mocks.worker();
      const cluster = mocks.cluster();

      plugin(mocks.process()).onMaster(cluster);
      cluster.emit('disconnect', worker);
      clock.tick(6000);

      expect(worker.killAttemptCount).to.equal(1);
      expect(logTestkit.stdout).to.be.string('Worker with id 1 killed');
    });

    it('does not attempt to kill a worker if it is already dead', () => {
      const worker = mocks.worker({isDead: false});
      const cluster = mocks.cluster();

      plugin(mocks.process()).onMaster(cluster);
      cluster.emit('disconnect', worker);
      worker.setIsDead(true);
      clock.tick(6000);

      expect(worker.killAttemptCount).to.equal(0);
      expect(logTestkit.stdout).to.be.string('Worker with id 1 died, not killing anymore');
    });

    it('disconnects worker on "uncaughtException"', () => {
      const currentProcess = mocks.process();
      const worker = mocks.worker();

      plugin(currentProcess).onWorker(worker);
      currentProcess.emit('uncaughtException', new Error('woop'));

      expect(worker.disconnectAttemptCount).to.equal(1);
      expect(logTestkit.stdout).to.be.string('Worker with id: 1 encountered "uncaughtException"');
    });
});