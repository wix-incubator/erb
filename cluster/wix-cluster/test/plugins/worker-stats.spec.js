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
      const {workerMetrics, cluster, gauge} = setupOnMaster(this);

      cluster.emit('message', {}, messages.workerMemoryStatsMessage({rss: 1, heapTotal: 2, heapUsed: 3}));

      expect(workerMetrics.gauge).to.have.been.calledWith('memory-rss-mb');
      expect(workerMetrics.gauge).to.have.been.calledWith('memory-heap-total-mb');
      expect(workerMetrics.gauge).to.have.been.calledWith('memory-heap-used-mb');
      
      expect(gauge.getCall(0).args[0]).to.equal(1);
      expect(gauge.getCall(1).args[0]).to.equal(2);
      expect(gauge.getCall(2).args[0]).to.equal(3);
    }));

    it('should update sent memory stats on new messages from workers', sinon.test(function () {
      const {cluster, gauge} = setupOnMaster(this);

      cluster.emit('message', {}, messages.workerMemoryStatsMessage({rss: 1, heapTotal: 2, heapUsed: 3}));
      expect(gauge.getCall(0).args[0]).to.equal(1);
      expect(gauge.getCall(1).args[0]).to.equal(2);
      expect(gauge.getCall(2).args[0]).to.equal(3);
      
      cluster.emit('message', {}, messages.workerMemoryStatsMessage({rss: 10, heapTotal: 20, heapUsed: 30}));
      expect(gauge.getCall(3).args[0]).to.equal(10);
      expect(gauge.getCall(4).args[0]).to.equal(20);
      expect(gauge.getCall(5).args[0]).to.equal(30);
    }));


    it('should listen on event loop stats from workers and publish to metrics', sinon.test(function () {
      const {workerMetrics, hist, cluster} = setupOnMaster(this);

      cluster.emit('message', {}, messages.workerEventLoopMessage(10));

      expect(workerMetrics.hist).to.have.been.calledWith('process', 'event-loop-ms');
      expect(hist.getCall(0).args[0]).to.equal(10);
    }));

    it('should update sent event loop stats on new messages from workers', sinon.test(function () {
      const {hist, cluster} = setupOnMaster(this);

      cluster.emit('message', {}, messages.workerEventLoopMessage(10));
      expect(hist.getCall(0).args[0]).to.equal(10);

      cluster.emit('message', {}, messages.workerEventLoopMessage(100));
      expect(hist.getCall(1).args[0]).to.equal(100);
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

    plugin.worker(eventLoop, memoryUsage)({currentProcess: process});

    return {process, processMessages, workerMetrics, eventLoop, memoryUsage, memoryStop, eventLoopStop};
  }

  function setupOnMaster() {
    const cluster = new EventEmitter();

    const metrics = new WixMeasured('host', 'app').collection('name', 'val');
    const workerMetrics = sinon.stub(metrics);
    const meter = sinon.spy();
    const gauge = sinon.spy();
    const hist = sinon.spy();

    workerMetrics.meter.returns(meter);
    workerMetrics.gauge.returns(gauge);
    workerMetrics.hist.returns(hist);

    plugin.master(workerMetrics)({cluster});

    return {cluster, workerMetrics, gauge, meter, hist};
  }

  function emitEventLoopMsg(eventLoop, ns) {
    eventLoop.callArgWith(0, ns);
  }

  function emitMemoryStatsMsg(memory, data) {
    memory.callArgWith(0, data);
  }
});
