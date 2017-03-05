'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  WixMeasured = require('wix-measured'),
  EventEmitter = require('events'),
  plugin = require('../../lib/plugins/master-stats');

describe('master stats', () => {

  it('should report worker fork events', sinon.test(function() {
    const {cluster, masterMetrics, meter} = setup(this);
    
    cluster.emit('fork', {});
    cluster.emit('fork', {});

    expect(masterMetrics.meter).to.have.been.calledWith('process', 'fork');
    expect(meter).to.have.been.calledTwice;
  }));

  it('should repgister on uptime gauge', sinon.test(function() {
    const {masterMetrics, gauge, process} = setup(this);
    
    process.uptime.returns(123);

    expect(masterMetrics.gauge).to.have.been.calledWith('process', 'uptime-minutes');
    expect(gauge.getCall(1).args[0]()).to.equal(2);
  }));
  
  
  it('should report worker exit events', sinon.test(function() {
    const {cluster, masterMetrics, meter} = setup(this);

    cluster.emit('exit', {});
    cluster.emit('exit', {});

    expect(masterMetrics.meter).to.have.been.calledWith('process', 'exit');
    expect(meter).to.have.been.calledTwice;
  }));

  it('should register on worker count gauge', sinon.test(function() {
    const {cluster, masterMetrics, gauge} = setup(this);
    cluster.workers = {'1': {}, '2': {}};

    expect(masterMetrics.gauge).to.have.been.calledWith('process', 'worker-count');
    expect(gauge.getCall(0).args[0]()).to.equal(2);
  }));

  it('should report event loop metrics', sinon.test(function() {
    const {masterMetrics, eventLoop, hist} = setup(this);

    eventLoop.callArgWith(0, 10);

    expect(masterMetrics.hist).to.have.been.calledWith('process', 'event-loop-ms');
    expect(hist.getCall(0).args[0]).to.equal(10);
  }));

  it('should report memory stats', sinon.test(function() {
    const {masterMetrics, memoryUsage, gauge} = setup(this);

    memoryUsage.callArgWith(0, {rss: 1, heapTotal: 2, heapUsed: 3});

    expect(masterMetrics.gauge).to.have.been.calledWith('memory', 'rss-mb');
    expect(masterMetrics.gauge).to.have.been.calledWith('memory', 'heap-total-mb');
    expect(masterMetrics.gauge).to.have.been.calledWith('memory', 'heap-used-mb');
    
    expect(gauge.getCall(2).args[0]).to.equal(1);
    expect(gauge.getCall(3).args[0]).to.equal(2);
    expect(gauge.getCall(4).args[0]).to.equal(3);
  }));

  function setup(ctx) {
    const cluster = new EventEmitter();
    const eventLoop = ctx.spy();
    const memoryUsage = ctx.spy();
    const process = new EventEmitter();
    process.uptime = ctx.stub();

    const metrics = new WixMeasured('host', 'app').collection('name', 'val');
    const masterMetrics = ctx.stub(metrics);
    const meter = ctx.spy();
    const gauge = ctx.spy();
    const hist = ctx.spy();

    masterMetrics.meter.returns(meter);
    masterMetrics.gauge.returns(gauge);
    masterMetrics.hist.returns(hist);
    
    plugin.master(masterMetrics, eventLoop, memoryUsage, process)({cluster});

    return {cluster, masterMetrics, meter, gauge, hist, eventLoop, memoryUsage, process};
  }
});
