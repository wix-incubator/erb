'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  WixMeasured = require('wix-measured'),
  connect = require('../../lib/meter/connect-statsd'),
  StatsD = require('node-statsd'),
  WixMeasuredStatsdAdapter = require('wix-measured-statsd-adapter');

describe('connect-statsd', () => {

  it('should connect statsd to wix measured adapter', sinon.test(function() {
    const {StatsDConstructor, StatsdAdapterConstructor, adapterInstance, statsdInstance, metrics} = setup(this);

    connect(StatsDConstructor, StatsdAdapterConstructor)(metrics, {host: 'a-host', interval: 20});

    expect(StatsDConstructor).to.have.been.calledWith({host: 'a-host'}).calledWithNew;
    expect(StatsdAdapterConstructor).to.have.been.calledWith(statsdInstance, {interval: 20}).calledWithNew;
    expect(adapterInstance.addTo).to.have.been.calledWith(metrics);
  }));

  function setup(ctx) {
    const metrics = sinon.createStubInstance(WixMeasured);
    const statsdInstance = sinon.createStubInstance(StatsD);
    const adapterInstance = sinon.createStubInstance(WixMeasuredStatsdAdapter);
    const StatsdAdapterConstructor = ctx.stub().returns(adapterInstance);
    const StatsDConstructor = ctx.stub().returns(statsdInstance);

    return {StatsDConstructor, StatsdAdapterConstructor, adapterInstance, statsdInstance, metrics};
  }
});