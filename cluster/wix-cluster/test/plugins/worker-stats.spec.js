'use strict';
const expect = require('chai').use(require('sinon-chai')).use(require('chai-things')).expect,
  sinon = require('sinon'),
  WixMeasured = require('wix-measured'),
  EventEmitter = require('events'),
  plugin = require('../../lib/plugins/worker-stats'),
  messages = require('../../lib/messages');

describe('worker stats', () => {

  describe('on worker', () => {
    it('should send memory stats and event loop metrics to master', sinon.test(function () {
      const {processMessages, memoryUsage, eventLoop} = setupOnWorker(this);

      emitEventLoopMsg(eventLoop, 10);
      emitMemoryStatsMsg(memoryUsage, {rss: 1, heapTotal: 2, heapUsed: 3});

      expect(processMessages).to.contain.an.item.that.deep.equals(messages.workerMemoryStatsMessage({
        rss: 1,
        heapTotal: 2,
        heapUsed: 3}));

      expect(processMessages).to.contain.an.item.that.deep.equals(messages.workerEventLoopMessage(10));
    }));

    it('should stop eventLoop, memory stats on uncaughtException only once', sinon.test(function () {
      const {process, eventLoopStop, memoryStop} = setupOnWorker(this);

      process.emit('uncaughtException', new Error('woops'));
      process.emit('uncaughtException', new Error('woops'));

      expect(eventLoopStop).to.have.been.calledOnce;
      expect(memoryStop).to.have.been.calledOnce;
    }));
  });

  describe('on master', () => {

    it('should listen on memory stats from workers and publish to metrics', sinon.test(function () {
      const {workerMetrics, cluster} = setupOnMaster(this);

      cluster.emit('message', {}, messages.workerMemoryStatsMessage({rss: 1, heapTotal: 2, heapUsed: 3}));

      expect(gaugeCall(workerMetrics, 0)).to.deep.equal({name: 'memory-rss-mb', value: 1});
      expect(gaugeCall(workerMetrics, 1)).to.deep.equal({name: 'memory-heap-total-mb', value: 2});
      expect(gaugeCall(workerMetrics, 2)).to.deep.equal({name: 'memory-heap-used-mb', value: 3});
    }));

    it('should update sent memory stats on new messages from workers', sinon.test(function () {
      const {workerMetrics, cluster} = setupOnMaster(this);

      cluster.emit('message', {}, messages.workerMemoryStatsMessage({rss: 1, heapTotal: 2, heapUsed: 3}));
      expect(gaugeCall(workerMetrics, 0)).to.deep.equal({name: 'memory-rss-mb', value: 1});
      expect(gaugeCall(workerMetrics, 1)).to.deep.equal({name: 'memory-heap-total-mb', value: 2});
      expect(gaugeCall(workerMetrics, 2)).to.deep.equal({name: 'memory-heap-used-mb', value: 3});

      cluster.emit('message', {}, messages.workerMemoryStatsMessage({rss: 10, heapTotal: 20, heapUsed: 30}));
      expect(gaugeCall(workerMetrics, 3)).to.deep.equal({name: 'memory-rss-mb', value: 10});
      expect(gaugeCall(workerMetrics, 4)).to.deep.equal({name: 'memory-heap-total-mb', value: 20});
      expect(gaugeCall(workerMetrics, 5)).to.deep.equal({name: 'memory-heap-used-mb', value: 30});
    }));


    it('should listen on event loop stats from workers and publish to metrics', sinon.test(function () {
      const {workerMetrics, cluster} = setupOnMaster(this);

      cluster.emit('message', {}, messages.workerEventLoopMessage(10));

      expect(workerMetrics.hist).to.have.been.calledWith('event-loop-ms', 10).calledOnce;
    }));

    it('should update sent event loop stats on new messages from workers', sinon.test(function () {
      const {workerMetrics, cluster} = setupOnMaster(this);

      cluster.emit('message', {}, messages.workerEventLoopMessage(10));
      expect(workerMetrics.hist).to.have.been.calledWith('event-loop-ms', 10).calledOnce;

      cluster.emit('message', {}, messages.workerEventLoopMessage(100));
      expect(workerMetrics.hist).to.have.been.calledWith('event-loop-ms', 100).calledTwice;
    }));
  });

  function setupOnWorker(ctx) {
    const processMessages = [];
    const process = new EventEmitter();
    process.on('message', msg => processMessages.push(msg));
    process.send = msg => process.emit('message', msg);

    const workerMetrics = sinon.createStubInstance(WixMeasured);

    const eventLoopStop = ctx.spy();
    const eventLoop = ctx.stub().returns(eventLoopStop);

    const memoryStop = ctx.spy();
    const memoryUsage = ctx.stub().returns(memoryStop);

    plugin.worker({eventLoop, memoryUsage, currentProcess: process})();

    return {process, processMessages, workerMetrics, eventLoop, memoryUsage, memoryStop, eventLoopStop};
  }

  function setupOnMaster() {
    const cluster = new EventEmitter();

    const workerMetrics = sinon.createStubInstance(WixMeasured);

    plugin.master({workerMetrics})(cluster);

    return {cluster, workerMetrics};
  }

  function gaugeCall(metrics, index) {
    return {
      name: metrics.gauge.args[index][0],
      value: metrics.gauge.args[index][1],
    }
  }

  function emitEventLoopMsg(eventLoop, ns) {
    eventLoop.callArgWith(0, ns);
  }

  function emitMemoryStatsMsg(memory, data) {
    memory.callArgWith(0, data);
  }
});