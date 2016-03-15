'use strict';
const chai = require('chai'),
  expect = chai.expect,
  statsPlugin = require('../lib/plugins/cluster-stats'),
  _ = require('lodash'),
  mocks = require('./support/mocks');

chai.use(require('chai-things'));

describe('plugins/cluster-stats should send events on topic "cluster-stats"', () => {
  let cluster, exchange;

  beforeEach(() => {
    cluster = mocks.cluster();
    exchange = mocks.exchange();
  });

  it('with memory usage stats from worker processes periodically', done => {
    aStatsPlugin(1).onWorker(cluster, _.noop);
    setTimeout(() => {
      assertMemoryUsageEvents(2, 'worker-1');
      done();
    }, 1500);
  });

  function assertMemoryUsageEvents(count, id) {
    const memStats = process.memoryUsage();
    expect(exchange.topic).to.equal('cluster-stats');
    expect(exchange.messages.length).to.equal(count);

    expect(exchange.messages).to.all.contain.deep.property('id', id);
    expect(exchange.messages).to.all.contain.deep.property('pid', process.pid);
    expect(exchange.messages).to.all.satisfy(evt =>
      somethingLike(evt.stats.rss, memStats.rss) &&
      somethingLike(evt.stats.heapTotal, memStats.heapTotal) &&
      somethingLike(evt.stats.heapUsed, memStats.heapUsed)
    );
  }

  function somethingLike(what, toWhat) {
    return what < toWhat + 1000000 && what > toWhat - 1000000 && what > 0;
  }

  function aStatsPlugin(periodicitySec) {
    const periodicity = periodicitySec || 600;
    return statsPlugin(exchange, {periodicitySec: periodicity});
  }
});
