'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  WixMeasured = require('wix-measured'),
  EventEmitter = require('events'),
  plugin = require('../../lib/plugins/master-stats');

describe('master stats', () => {

  it('should report worker fork events', sinon.test(function() {
    const {cluster, masterMetrics} = setup(this);

    cluster.emit('fork', {});
    cluster.emit('fork', {});

    expect(masterMetrics.meter).to.have.been.calledWith('fork').calledTwice;
  }));

  it('should repgister on uptime gauge', sinon.test(function() {
    const {masterMetrics, process} = setup(this);
    
    process.uptime.returns(123);

    expect(masterMetrics.gauge.getCall(1).args[1]()).to.equal(2);
  }));
  
  
  it('should report worker exit events', sinon.test(function() {
    const {cluster, masterMetrics} = setup(this);

    cluster.emit('exit', {});
    cluster.emit('exit', {});

    expect(masterMetrics.meter).to.have.been.calledWith('exit').calledTwice;
  }));

  it('should register on worker count gauge', sinon.test(function() {
    const {cluster, masterMetrics} = setup(this);
    cluster.workers = {'1': {}, '2': {}};

    expect(masterMetrics.gauge.getCall(0).args[1]()).to.equal(2);
  }));

  it('should report event loop metrics', sinon.test(function() {
    const {masterMetrics, eventLoop} = setup(this);

    eventLoop.callArgWith(0, 10);

    expect(masterMetrics.hist).to.have.been.calledWith('event-loop-ms', 10).calledOnce;
  }));

  it('should report memory stats', sinon.test(function() {
    const {masterMetrics, memoryUsage} = setup(this);

    memoryUsage.callArgWith(0, {rss: 1, heapTotal: 2, heapUsed: 3});

    expect(masterMetrics.gauge).to.have.been.calledWith('memory-rss-mb', 1);
    expect(masterMetrics.gauge).to.have.been.calledWith('memory-heap-total-mb', 2);
    expect(masterMetrics.gauge).to.have.been.calledWith('memory-heap-used-mb', 3);
  }));

  function setup(ctx) {
    const cluster = new EventEmitter();
    const eventLoop = ctx.spy();
    const masterMetrics = sinon.createStubInstance(WixMeasured);
    const memoryUsage = ctx.spy();
    const process = new EventEmitter();
    process.uptime = ctx.stub();

    plugin.master(masterMetrics, eventLoop, memoryUsage, process)({cluster});

    return {cluster, masterMetrics, eventLoop, memoryUsage, process};
  }
});
