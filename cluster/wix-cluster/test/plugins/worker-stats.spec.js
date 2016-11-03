'use strict';
const expect = require('chai').use(require('sinon-chai')).use(require('chai-things')).expect,
  sinon = require('sinon'),
  WixMeasured = require('wix-measured'),
  EventEmitter = require('events'),
  MemoryUsage = require('../../lib/meter/memory-usage'),
  Plugin = require('../../lib/plugins/worker-stats'),
  messages = require('../../lib/messages');

describe('worker stats', () => {

  describe('on worker', () => {
    it('should send memory stats and event loop metrics to master', sinon.test(function () {
      const {processMessages, memory} = setupOnWorker(this);

      this.clock.tick(5000);

      expect(processMessages).to.contain.an.item.that.deep.equals(messages.workerMemoryStatsMessage({
        heapTotal: memory.heapTotal(),
        heapUsed: memory.heapUsed(),
        rss: memory.rss()
      }));

      expect(processMessages).to.contain.an.item.that.deep.equals(messages.workerEventLoopMessage(10));
    }));

    it('should send memory stats immediately after fork', sinon.test(function () {
      const {processMessages, memory} = setupOnWorker(this);

      expect(processMessages.filter(el => el.key === 'worker-stats-memory')).to.have.lengthOf(1);
    }));


    it('should periodically send memory stats and event loop metrics to master', sinon.test(function () {
      const {processMessages} = setupOnWorker(this);

      this.clock.tick(5000);
      expect(processMessages.filter(el => el.key === 'worker-stats-memory')).to.have.lengthOf(2);

      this.clock.tick(5000);
      expect(processMessages.filter(el => el.key === 'worker-stats-memory')).to.have.lengthOf(3);

    }));

    it('should stop sending stats on uncaughtException', sinon.test(function () {
      const {processMessages, process} = setupOnWorker(this);

      this.clock.tick(5000);
      expect(processMessages).to.have.lengthOf(3);

      process.emit('uncaughtException', new Error('woops'));

      expect(processMessages).to.have.lengthOf(3);
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

    const eventLoop = ctx.spy();
    const workerMetrics = sinon.createStubInstance(WixMeasured);
    const memory = sinon.createStubInstance(MemoryUsage);

    new Plugin(workerMetrics, eventLoop, memory, process).onWorker();

    memory.rss.returns(1);
    memory.heapUsed.returns(2);
    memory.heapTotal.returns(3);
    eventLoop.callArgWith(0, 10);

    return {process, processMessages, workerMetrics, eventLoop, memory};
  }

  function setupOnMaster(ctx) {
    const cluster = new EventEmitter();

    const eventLoop = ctx.spy();
    const workerMetrics = sinon.createStubInstance(WixMeasured);
    const memory = sinon.createStubInstance(MemoryUsage);

    new Plugin(workerMetrics, eventLoop, memory).onMaster(cluster);

    return {cluster, workerMetrics};
  }

  function gaugeCall(metrics, index) {
    return {
      name: metrics.gauge.args[index][0],
      value: metrics.gauge.args[index][1](),
    }
  }
});