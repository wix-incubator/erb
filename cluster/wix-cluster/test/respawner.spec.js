'use strict';
var chai = require('chai'),
  should = chai.should(),
  sinonChai = require('sinon-chai'),
  sinon = require('sinon'),
  respawner = require('../lib/plugins/cluster-respawner'),
  events = require('events');

chai.use(sinonChai);

describe('plugins/cluster-respawner', function () {
  var cluster, next, clock;

  it('registers onto "disconnect" event and calls next callback in chain', () => {
    respawner().onMaster(cluster, next);

    cluster.on.should.be.calledWith('disconnect');
    next.should.be.calledOnce;
  });

  it('calls a cluster.fork on "disconnect" event', () => {
    respawner().onMaster(cluster, next);

    cluster.emit('disconnect');

    cluster.fork.should.be.calledOnce;
  });

  it('stops respawning once reaches preconfigured respawn count per interval', () => {
    respawner({count: 10, inSeconds: 10}).onMaster(cluster, next);

    for (let i = 0; i < 10; i++) {
      cluster.emit('disconnect');
    }

    clock.tick(10000);
    cluster.emit('disconnect');

    cluster.fork.should.be.callCount(10);
  });

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    next = sinon.spy();

    cluster = new events.EventEmitter();
    cluster.fork = sinon.spy();
    cluster.on = sinon.spy(cluster, 'on');
  });

  afterEach(() => {
    clock.restore();
  });
});

