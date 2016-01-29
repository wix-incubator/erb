'use strict';
const statsCollector = require('../lib/views/about').statsCollector,
  _ = require('lodash'),
  expect = require('chai').expect;

describe('views/about stats collector', () => {
  let exchange, cluster, collector;

  beforeEach(() => {
    exchange = new ExchangeMock();
    cluster = new ClusterMock();
    collector = statsCollector(exchange, cluster);
  });

  it('should return process count', () => {
    expect(collector.processCount).to.equal(3);
  });

  it('should return worker die count as 0 given there were no disconnect events', () => {
    expect(collector.workerDieCount).to.equal(0);
  });

  it('should return worker die count as 1 given there was 1 disconnect event', () => {
    exchange.emitMessage({type: 'disconnected', id: 1});
    expect(collector.workerDieCount).to.equal(1);
  });

  it('should report memory stats', () => {
    exchange.emitMessage({type: 'stats', id: 1, stats: {rss: 1, heapTotal: 2, heapUsed: 3}});
    exchange.emitMessage({type: 'stats', id: 'master', stats: {rss: 10, heapTotal: 20, heapUsed: 30}});
    expect(collector.memory).to.deep.equal({rss: 11, heapTotal: 22, heapUsed: 33});
  });

  it('should return correct memory stats after worker death', () => {
    exchange.emitMessage({type: 'stats', id: 1, stats: {rss: 1, heapTotal: 2, heapUsed: 3}});
    exchange.emitMessage({type: 'stats', id: 'master', stats: {rss: 10, heapTotal: 20, heapUsed: 30}});
    expect(collector.memory).to.deep.equal({rss: 11, heapTotal: 22, heapUsed: 33});

    exchange.emitMessage({type: 'disconnected', id: 1});
    expect(collector.memory).to.deep.equal({rss: 10, heapTotal: 20, heapUsed: 30});
  });
});

class ExchangeMock {
  constructor() {
    this.fn = _.noop;
  }

  onMessage(fn) {
    this.fn = fn;
  }

  emitMessage(msg) {
    this.fn(msg);
  }
}

class ClusterMock {
  get workers() {
    return {worker1: '1', worker2: '2'};
  }
}