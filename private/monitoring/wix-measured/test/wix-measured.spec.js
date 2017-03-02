const expect = require('chai').use(require('sinon-chai')).expect,
  WixMeasuredFactory = require('..'),
  WixMeasuredRegistry = require('../lib/wix-measured-registry'),
  WixMeasured = require('../lib/wix-measured'),
  FilteringReporter = require('./support/reporter'),
  Logger = require('wnp-debug').Logger,
  sinon = require('sinon');

describe('wix measured', () => {

  describe('meter', () => {

    it('should not push a non-numeric metric, but log error instead', () => {
      const log = sinon.createStubInstance(Logger);
      const registry = new WixMeasuredRegistry({prefix: 'prfx'});
      const measured = new WixMeasured({registry, log});
      
      measured.meter('someKey', 'someValue')('qwe');
      
      expect(metricsFrom(registry.meters).pop().toJSON().count).to.equal(0);
      expect(log.error).to.have.been.calledWithMatch('someKey=someValue');
    });
    
    it('should create a new meter with key "meter" by default', () => {
      const {measured, reporter} = aWixMeasured();

      measured.meter('rpm')(1);
      assertMeterCountValue(reporter, 'meter=rpm', 1);
    });

    it('should create a new meter with provided key and value', () => {
      const {measured, reporter} = aWixMeasured();

      measured.meter('metering', 'rpm')(1);
      assertMeterCountValue(reporter, 'metering=rpm', 1);
    });


    it('should reuse same meter from registry for subsequent invocations', () => {
      const {measured, reporter} = aWixMeasured();

      const meter = measured.meter('rpm');
      meter(1);
      meter(2);

      assertMeterCountValue(reporter, 'rpm', 3);
    });

    it('should configure meter to report minute rate', sinon.test(function () {
      const {measured, reporter} = aWixMeasured();

      const meter = measured.meter('rpm');
      for (let i = 0; i < 60; i++) {
        meter(10);
        this.clock.tick(10000);
      }

      assertMeterRateValue(reporter, 'rpm', {from: 55, to: 65});
    }));
  });

  describe('gauge', () => {

    it('should not push a non-numeric metric, but log error instead for value-based gauge', () => {
      const log = sinon.createStubInstance(Logger);
      const registry = new WixMeasuredRegistry({prefix: 'prfx'});
      const measured = new WixMeasured({registry, log});

      measured.gauge('someKey', 'someValue')('qwe');

      expect(metricsFrom(registry.gauges).pop().toJSON()).to.be.undefined;
      expect(log.error).to.have.been.calledWithMatch('someKey=someValue');
    });

    it('should not push a non-numeric metric, but log error instead for function-based gauge', () => {
      const log = sinon.createStubInstance(Logger);
      const registry = new WixMeasuredRegistry({prefix: 'prfx'});
      const measured = new WixMeasured({registry, log});

      measured.gauge('someKey', 'someValue')(() => 'qwe');

      expect(metricsFrom(registry.gauges).pop().toJSON()).to.be.undefined;
      expect(log.error).to.have.been.calledWithMatch('someKey=someValue');
    });
    
    
    it('should create a new gauge with key "gauge" and with function', () => {
      const {measured, reporter} = aWixMeasured();

      measured.gauge('reqPerSecond')(() => 1);
      assertGaugeValue(reporter, 'gauge=reqPerSecond', 1);
    });

    it('should allow to provide custom key', () => {
      const {measured, reporter} = aWixMeasured();

      measured.gauge('aGauge', 'reqPerSecond')(() => 1);
      assertGaugeValue(reporter, 'aGauge=reqPerSecond', 1);
    });


    it('should create a new gauge with value', () => {
      const {measured, reporter} = aWixMeasured();

      measured.gauge('reqPerSecond')(1);
      assertGaugeValue(reporter, 'reqPerSecond', 1);
    });

    it('should allow to override gauge', () => {
      const {measured, reporter} = aWixMeasured();
      const gauge = measured.gauge('reqPerSecond');

      gauge(() => 1);
      assertGaugeValue(reporter, 'reqPerSecond', 1);

      gauge(3);
      assertGaugeValue(reporter, 'reqPerSecond', 3);
    });
  });

  describe('histogram', () => {

    it('should not push a non-numeric metric, but log error instead', () => {
      const log = sinon.createStubInstance(Logger);
      const registry = new WixMeasuredRegistry({prefix: 'prfx'});
      const measured = new WixMeasured({registry, log});

      measured.hist('someKey', 'someValue')('qwe');

      expect(metricsFrom(registry.hists).pop().toJSON().count).to.equal(0);
      expect(log.error).to.have.been.calledWithMatch('someKey=someValue');
    });
    
    it('should create a new histogram with default key "hist"', () => {
      const {measured, reporter} = aWixMeasured();

      measured.hist('reqPerSecond')(1);
      assertHistInvocations(reporter, 'hist=reqPerSecond', 1);
    });

    it('should allow to provide custom key', () => {
      const {measured, reporter} = aWixMeasured();

      measured.hist('aHist', 'reqPerSecond')(1);
      assertHistInvocations(reporter, 'aHist=reqPerSecond', 1);
    });


    it('should reuse same meter from registry for subsequent invocations', () => {
      const {measured, reporter} = aWixMeasured();
      const hist = measured.hist('reqPerSecond');

      hist(1);
      hist(12);
      assertHistInvocations(reporter, 'reqPerSecond', 2);
    });
  });

  describe('collection', () => {

    it('should validate presence of at least 1 tag', () => {
      const {factory} = aWixMeasured();
      expect(() => factory.collection()).to.throw('mandatory');
      expect(() => factory.collection({})).to.throw('be a string');
    });

    it('should return a new measured instance with same key if prefix is not provided', () => {
      const {factory, reporter} = aWixMeasured();
      const collection = factory.collection('childKey', 'childValue');

      assertPrefixForMetrics('childKey=childValue', collection, reporter);
    });

    it('should return a new measured instance with suffix added to parent prefix', () => {
      const {factory, reporter} = aWixMeasured();      

      const collection = factory.addReporter(reporter)
        .collection('parentKey', 'parentValue')
        .collection('childKey', 'childValue');

      assertPrefixForMetrics('parentKey=parentValue.childKey=childValue', collection, reporter);
    });
  });
});

function assertPrefixForMetrics(prefix, measured, collector) {
  measured.meter('reqPerSecond')(1);

  expect(collector.meters((prefix === '' ? '' : prefix + '.'))).to.not.be.undefined;
}

function assertMeterCountValue(reporter, name, expectedValue) {
  expect(reporter.meters(name).toJSON().count).to.equal(expectedValue);
}

function assertMeterRateValue(reporter, name, expectedRange) {
  expect(reporter.meters(name).toJSON()['1MinuteRate']).to.be.within(expectedRange.from, expectedRange.to);
}

function assertGaugeValue(reporter, name, expectedValue) {
  expect(reporter.gauges(name).toJSON()).to.equal(expectedValue);
}

function assertHistInvocations(reporter, name, count) {
  expect(reporter.hists(name).toJSON().count).to.equal(count);
}

function aWixMeasured(host = 'local', app = 'app') {
  const reporter = new FilteringReporter();
  const factory = new WixMeasuredFactory(host, app).addReporter(reporter);
  const measured = factory.collection('key', 'value');

  return {reporter, factory, measured};
}

function metricsFrom(obj) {
  return Object.keys(obj).map(key => obj[key]);
}
