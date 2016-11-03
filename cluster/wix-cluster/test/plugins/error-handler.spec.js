'use strict';
const expect = require('chai').expect,
  lolex = require('lolex'),
  plugin = require('../../lib/plugins/error-handler'),
  mocks = require('../support/mocks'),
  testkit = require('wix-stdouterr-testkit'),
  log = require('wnp-debug')('for-tests');

describe('error handler plugin', () => {
  const logTestkit = testkit.interceptor().beforeAndAfterEach();
  let shutdownInvoked = false;

  let clock;

  beforeEach(() => {
    clock = lolex.install();
    shutdownInvoked = false;
  });
  afterEach(() => clock.uninstall());

  it('kills a worker if it is still alive after predefined timeout', () => {
    const worker = mocks.worker();
    const cluster = mocks.cluster();

    plugin.master({log})(cluster);
    cluster.emit('disconnect', worker);
    clock.tick(6000);

    expect(worker.killAttemptCount).to.equal(1);
    expect(logTestkit.stderr).to.be.string('Worker with id 1 killed');
  });

  it('does not attempt to kill a worker if it is already dead', () => {
    const worker = mocks.worker({isDead: false});
    const cluster = mocks.cluster();

    plugin.master({log})(cluster);
    cluster.emit('disconnect', worker);
    worker.setIsDead(true);
    clock.tick(6000);

    expect(worker.killAttemptCount).to.equal(0);
    expect(logTestkit.stderr).to.be.string('Worker with id 1 died, not killing anymore');
  });

  it('disconnects worker on "uncaughtException" and invokes app shutdown function', () => {
    const currentProcess = mocks.process();
    const worker = mocks.worker();

    plugin.worker({log, currentProcess, shutdownAppProvider: () => shutdownInvoked = true})(worker);
    currentProcess.emit('uncaughtException', new Error('woop'));

    expect(worker.disconnectAttemptCount).to.equal(1);
    expect(shutdownInvoked).to.equal(true);
    expect(logTestkit.stderr).to.be.string('Worker with id: 1 encountered "uncaughtException"');
  });
});