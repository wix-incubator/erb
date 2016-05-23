'use strict';
const expect = require('chai').expect,
  plugin = require('../../lib/plugins/respawner'),
  mocks = require('../support/mocks'),
  lolex = require('lolex'),
  testkit = require('wix-stdouterr-testkit');

describe('respawner plugin', () => {
  const logTestkit = testkit.interceptor().beforeAndAfterEach();

  let clock;

  beforeEach(() => clock = lolex.install());
  afterEach(() => clock.uninstall());

  it('forks a new worker on worker disconnect', () => {
    const cluster = mocks.cluster();
    const worker = mocks.worker();

    plugin().onMaster(cluster);
    cluster.emit('disconnect', worker);

    expect(cluster.forkedCount).to.equal(2);
    expect(logTestkit.stderr).to.be.string('Spawning new worker. die count: 1');
  });

  it('stops respawning once preconfigured respawn count per interval is reached', () => {
    const cluster = mocks.cluster();

    plugin().onMaster(cluster);
    for (let i = 0; i <= 11; i++) {
      cluster.emit('disconnect', mocks.worker());
    }

    expect(cluster.forkedCount).to.equal(10);
    expect(logTestkit.stderr).to.be.string('Detected cyclic death not spawning new worker, die count: 11');
  });

  it('respawns given delay period expired', () => {
    const cluster = mocks.cluster();

    plugin().onMaster(cluster);

    for (let i = 0; i < 11; i++) {
      cluster.emit('disconnect', mocks.worker());
    }
    expect(cluster.forkedCount).to.equal(10);

    clock.tick(11000);

    cluster.emit('disconnect', mocks.worker());
    expect(cluster.forkedCount).to.equal(11);
  });
});

