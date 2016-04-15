'use strict';
const expect = require('chai').expect,
  testkit = require('./support/testkit');

describe('wix cluster events', function () {
  this.timeout(30000);
  const app = testkit.server('custom-stats-periodicity').beforeAndAfterEach();

  it('should publish active worker count', () =>
    app.getStats().then(stats => expect(stats.workerCount).to.equal(2))
  );

  it('should publish worker death count', () =>
    app.getStats()
      .then(stats => expect(stats.deathCount).to.equal(0))
      .then(() => app.get('/die'))
      .then(() => testkit.delay())
      .then(() => app.getStats())
      .then(stats => expect(stats.deathCount).to.equal(1))
  );

  it('should publish memory stats', () =>
    app.getStats().then(stats => expect(stats.stats.rss).to.be.gt(0))
  );

  it('should publish memory stats periodically', () => {
    const collected = [];
    const getStats = () => app.getStats().then(stats => collected.push(stats.stats));
    return getStats()
      .then(() => testkit.delay())
      .then(() => getStats())
      .then(() => expect(collected.pop()).to.not.deep.equal(collected.pop()));
  });
});