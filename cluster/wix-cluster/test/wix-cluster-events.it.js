'use strict';
const expect = require('chai').expect,
  testkit = require('./support/testkit');

describe('wix cluster events', function () {
  this.timeout(30000);
  const app = testkit.server('custom-stats-periodicity').beforeAndAfterEach();

  it('should publish active worker count', () =>
    app.getStats().then(stats => expect(stats.workerCount).to.equal(1))
  );

  it('should publish worker death count', () =>
    app.getStats()
      .then(stats => expect(stats.deathCount).to.equal(0))
      .then(() => app.get('/die'))
      .then(() => testkit.delay())
      .then(() => app.getStats())
      .then(stats => expect(stats.deathCount).to.equal(1))
  );

  it('should broadcast messages from worker to all workers', () => {
    return app.get('/broadcast/aKey/aValue')
      .then(() => testkit.delay())
      .then(() => expect(app.events.filter(evt => evt.evt === 'broadcast' && evt.value.key === 'aKey').length).to.equal(1))
  });
});
