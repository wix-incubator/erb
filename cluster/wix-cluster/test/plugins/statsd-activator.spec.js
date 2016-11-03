'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  WixMeasured = require('wix-measured'),
  StatsD = require('node-statsd'),
  WixMeasuredStatsdAdapter = require('wix-measured-statsd-adapter'),
  EventEmitter = require('events'),
  plugin = require('../../lib/plugins/statsd-activator'),
  Logger = require('wnp-debug').Logger,
  messages = require('../../lib/messages');

describe('statsd-activator', () => {

  it('should activate statsd adapter on activation message from worker', sinon.test(function() {
    const {cluster, StatsDConstructor, StatsdAdapterConstructor, adapterInstance, statsdInstance, metrics, log} = setup(this);

    cluster.emit('message', {}, messages.statsdActivationMessage({host: 'a-host', interval: 20}));

    expect(StatsDConstructor).to.have.been.calledWith({host: 'a-host'}).calledWithNew;
    expect(StatsdAdapterConstructor).to.have.been.calledWith(statsdInstance, {interval: 20}).calledWithNew;
    expect(adapterInstance.addTo).to.have.been.calledWith(metrics);
    expect(log.debug).to.have.been.calledWith(sinon.match('activated with host: \'a-host\' and interval: \'20\''));
  }));

  it('should activate on first message only', sinon.test(function() {
    const {cluster, adapterInstance, log} = setup(this);

    cluster.emit('message', {}, messages.statsdActivationMessage({host: 'a-host', interval: 20}));
    cluster.emit('message', {}, messages.statsdActivationMessage({host: 'a-host', interval: 20}));

    expect(adapterInstance.addTo).to.have.been.calledOnce;
    expect(log.debug).to.have.been.calledOnce;
  }));

  it('should not activate adapter if message is of stats, but missing part of message', sinon.test(function() {
    const {cluster, adapterInstance, log} = setup(this);

    cluster.emit('message', {}, messages.statsdActivationMessage({host: 'a-host'}));

    expect(adapterInstance.addTo).to.not.have.been.called;
    expect(log.error).to.have.been.calledWith(sinon.match('but configuration is incomplete'));
  }));

  it('should not activate adapter for not matching message', sinon.test(function() {
    const {cluster, adapterInstance, log} = setup(this);

    cluster.emit('message', {}, messages.aWixClusterMessageWithKey('not-known'));

    expect(adapterInstance.addTo).to.not.have.been.called;
    expect(log.debug).to.not.have.been.called;
  }));

  function setup(ctx) {
    const cluster = new EventEmitter();
    const metrics = sinon.createStubInstance(WixMeasured);
    const statsdInstance = sinon.createStubInstance(StatsD);
    const adapterInstance = sinon.createStubInstance(WixMeasuredStatsdAdapter);
    const StatsdAdapterConstructor = ctx.stub().returns(adapterInstance);
    const StatsDConstructor = ctx.stub().returns(statsdInstance);
    const log = sinon.createStubInstance(Logger);

    plugin.master({metrics, StatsDAdapter: StatsdAdapterConstructor, StatsD: StatsDConstructor, log})(cluster);

    return {cluster, metrics, statsdInstance, adapterInstance, StatsdAdapterConstructor, StatsDConstructor, log};
  }

});