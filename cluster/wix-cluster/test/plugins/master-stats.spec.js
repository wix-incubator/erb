'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  WixMeasured = require('wix-measured'),
  EventEmitter = require('events'),
  MemoryUsage = require('../../lib/meter/memory-usage'),
  Plugin = require('../../lib/plugins/master-stats');

describe('master stats', () => {

  it('should report worker fork events', sinon.test(function() {
    const {cluster, masterMetrics} = setup(this);

    cluster.emit('fork', {});
    cluster.emit('fork', {});

    expect(masterMetrics.meter).to.have.been.calledWith('fork').calledTwice;
  }));

  it('should report worker exit events', sinon.test(function() {
    const {cluster, masterMetrics} = setup(this);

    cluster.emit('exit', {});
    cluster.emit('exit', {});

    expect(masterMetrics.meter).to.have.been.calledWith('exit').calledTwice;
  }));

  it('should report event loop metrics', sinon.test(function() {
    const {masterMetrics, eventLoop} = setup(this);

    eventLoop.callArgWith(0, 10);

    expect(masterMetrics.hist).to.have.been.calledWith('event-loop-ms', 10).calledOnce;
  }));

  it('should register callbacks to report memory status', sinon.test(function() {
    const {masterMetrics, memory} = setup(this);
    memory.rss.returns(1);
    memory.heapTotal.returns(2);
    memory.heapUsed.returns(3);

    expect(gaugeCall(masterMetrics, 0)).to.deep.equal({name: 'memory-rss-mb', value: 1});
    expect(gaugeCall(masterMetrics, 1)).to.deep.equal({name: 'memory-heap-total-mb', value: 2});
    expect(gaugeCall(masterMetrics, 2)).to.deep.equal({name: 'memory-heap-used-mb', value: 3});
  }));

  function setup(ctx) {
    const cluster = new EventEmitter();
    const eventLoop = ctx.spy();
    const masterMetrics = sinon.createStubInstance(WixMeasured);
    const memory = sinon.createStubInstance(MemoryUsage);

    const plugin = new Plugin(masterMetrics, eventLoop, memory).onMaster(cluster);

    return {cluster, masterMetrics, eventLoop, memory, plugin};
  }

  function gaugeCall(metrics, index) {
    return {
      name: metrics.gauge.args[index][0],
      value: metrics.gauge.args[index][1](),
    }
  }

});