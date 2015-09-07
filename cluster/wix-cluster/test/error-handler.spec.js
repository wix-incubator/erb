'use strict';
var chai = require('chai'),
  should = require('chai').should(),
  sinonChai = require('sinon-chai'),
  sinon = require('sinon'),
  errorHandler = require('../lib/plugins/cluster-error-handler'),
  events = require('events');

chai.use(sinonChai);

describe('plugins/cluster-error-handler', () => {

  describe('onMaster', () => {
    var cluster, next, clock, worker;

    it('registers onto "disconnect" event and calls next callback in chain', () => {
      cluster.on.should.be.calledWith('disconnect');
      next.should.be.calledOnce;
    });

    it('kills a worker if it is still alive after predefined timeout', () => {
      worker.isDead.returns(false);

      cluster.emit('disconnect', worker);
      clock.tick(2000);

      worker.kill.should.be.calledOnce;
    });

    it('does not attempt to kill a worker if it is already dead', () => {
      worker.isDead.returns(true);

      cluster.emit('disconnect', worker);
      clock.tick(2000);

      worker.kill.should.not.be.called;
    });

    beforeEach(() => {
      clock = sinon.useFakeTimers();
      next = sinon.spy();

      cluster = new events.EventEmitter();
      cluster.fork = sinon.spy();
      cluster.on = sinon.spy(cluster, 'on');

      worker = { id: 0, isDead: sinon.stub(), kill: sinon.spy() };

      errorHandler().onMaster(cluster, next);
    });

    afterEach(() => {
      clock.restore();
    });
  });

  describe('onWorker', () => {
    var worker, next;

    it('registers on "uncaughtException" and calls next callback in chain', () => {
      process.on.should.be.calledWith('uncaughtException');
      next.should.be.calledOnce;
    });

    it('disconnects worker on "uncaughtException"', () => {
      executeCallback(process.on);

      worker.disconnect.should.be.calledOnce;
    });

    beforeEach(() => {
      process.on = sinon.spy(process, 'on');
      next = sinon.spy();
      worker = {
        disconnect: sinon.spy()
      };

      errorHandler().onWorker(worker, next);
    });

    afterEach(() => {
      process.on.restore();
    });

    function executeCallback(onSpy) {
      onSpy.getCall(0).args[1]();
    }
  });
});