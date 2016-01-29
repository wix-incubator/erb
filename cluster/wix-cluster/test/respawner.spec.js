'use strict';
const expect = require('chai').expect,
  respawner = require('../lib/plugins/cluster-respawner'),
  mocks = require('./support/mocks'),
  _ = require('lodash');

describe('plugins/cluster-respawner', function () {
  this.timeout(5000);
  let cluster, exchange;

  beforeEach(() => {
    cluster = mocks.cluster();
    exchange = mocks.exchange();
  });

  it('forks a new worker on worker disconnect', done => {
    respawner(exchange).onMaster(cluster, _.noop);
    cluster.emitDisconnect();
    process.nextTick(() => {
      expect(cluster.forkedCount).to.equal(1);
      done();
    });
  });

  it('stops respawning once reaches preconfigured respawn count per interval', done => {
    respawner(exchange, {count: 10, inSeconds: 1}).onMaster(cluster, _.noop);

    for (let i = 0; i < 11; i++) {
      cluster.emitDisconnect();
    }
    process.nextTick(() => {
      expect(cluster.forkedCount).to.equal(10);
      done();
    });
  });

  it('respawns given delay period expired', done => {
    respawner(exchange, {count: 1, inSeconds: 1}).onMaster(cluster, _.noop);

    cluster.emitDisconnect();
    cluster.emitDisconnect();
    expect(cluster.forkedCount).to.equal(1);

    setTimeout(() => {
      cluster.emitDisconnect();
      process.nextTick(() => {
        expect(cluster.forkedCount).to.equal(2);
        done();
      });
    }, 1500);
  });
});

