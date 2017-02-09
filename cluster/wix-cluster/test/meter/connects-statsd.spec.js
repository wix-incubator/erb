'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  WixMeasured = require('wix-measured'),
  connect = require('../../lib/meter/connect-statsd'),
  StatsD = require('node-statsd'),
  WixMeasuredStatsdAdapter = require('wix-measured-statsd-adapter'),
  Logger = require('wnp-debug').Logger;

describe('connect-statsd', () => {

  it('should connect statsd to wix measured adapter and log message', sinon.test(function() {
    const {StatsDConstructor, StatsdAdapterConstructor, adapterInstance, statsdInstance, metrics, log} = setup(this);

    connect(StatsDConstructor, StatsdAdapterConstructor, log)(metrics, {host: 'a-host', interval: 20});

    expect(StatsDConstructor).to.have.been.calledWith({host: 'a-host'}).calledWithNew;
    expect(StatsdAdapterConstructor).to.have.been.calledWith(statsdInstance, {interval: 20}).calledWithNew;
    expect(metrics.addReporter).to.have.been.calledWith(adapterInstance);
    expect(log.debug).to.have.been.calledWithMatch('Configured master statsd');
  }));

  it('should not connect statsd if configuration is not provided and log message', sinon.test(function() {
    const {StatsDConstructor, StatsdAdapterConstructor, metrics, log} = setup(this);

    connect(StatsDConstructor, StatsdAdapterConstructor, log)(metrics);

    expect(metrics.addReporter).to.not.have.been.called;
    expect(log.debug).to.have.been.calledWithMatch('statsd configuration not provided');
  }));
  
  function setup(ctx) {
    const log = sinon.createStubInstance(Logger);
    const metrics = sinon.createStubInstance(WixMeasured);
    const statsdInstance = sinon.createStubInstance(StatsD);
    const adapterInstance = sinon.createStubInstance(WixMeasuredStatsdAdapter);
    const StatsdAdapterConstructor = ctx.stub().returns(adapterInstance);
    const StatsDConstructor = ctx.stub().returns(statsdInstance);

    return {StatsDConstructor, StatsdAdapterConstructor, adapterInstance, statsdInstance, metrics, log};
  }
});
