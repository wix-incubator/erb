const expect = require('chai').expect,
  Factory = require('..'),
  sinon = require('sinon');

describe('wix-measured', () => {

  describe('new Factory', () => {

    it('should validate mandatory arguments', () => {
      expect(() => new Factory()).to.throw('host');
      expect(() => new Factory('')).to.throw('host');
      expect(() => new Factory({})).to.throw('host');
      expect(() => new Factory('local')).to.throw('appName');
      expect(() => new Factory('local', {})).to.throw('appName');
      expect(() => new Factory('local', 'app')).to.not.throw(Error);
    });

    it('should create instance with common prefix', () => {
      const collectingReporter = aReporter();
      const metrics = aMetrics(collectingReporter, 'nonlocal', 'nonapp');

      assertPrefixForMetrics('root=node_app_info.host=nonlocal.app_name=nonapp', metrics, collectingReporter);
    });
  });

  describe('meter', () => {

    it('should create a new meter', () => {
      const collectingReporter = aReporter();
      const metrics = aMetrics(collectingReporter);

      metrics.meter('rpm')(1);
      assertMeterCountValue(collectingReporter, 'rpm', 1);
    });

    it('should reuse same meter from registry for subsequent invocations', () => {
      const collectingReporter = aReporter();
      const metrics = aMetrics(collectingReporter);

      const meter = metrics.meter('rpm');
      meter(1);
      meter(2);

      assertMeterCountValue(collectingReporter, 'rpm', 3);
    });

    it('should configure meter to report minute rate', sinon.test(function () {
      const collectingReporter = aReporter();
      const metrics = aMetrics(collectingReporter);
      const meter = metrics.meter('rpm');
      for (let i = 0; i < 60; i++) {
        meter(10);
        this.clock.tick(10000);
      }

      assertMeterRateValue(collectingReporter, 'rpm', {from: 55, to: 65});
    }));
  });

  describe('gauge', () => {

    it('should create a new gauge with function', () => {
      const collectingReporter = aReporter();
      const metrics = aMetrics(collectingReporter);

      metrics.gauge('reqPerSecond')(() => 1);
      assertGaugeValue(collectingReporter, 'reqPerSecond', 1);
    });

    it('should create a new gauge with value', () => {
      const collectingReporter = aReporter();
      const metrics = aMetrics(collectingReporter);

      metrics.gauge('reqPerSecond')(1);
      assertGaugeValue(collectingReporter, 'reqPerSecond', 1);
    });

    it('should allow to override gauge', () => {
      const collectingReporter = aReporter();
      const metrics = aMetrics(collectingReporter);
      const gauge = metrics.gauge('reqPerSecond');
      
      gauge(() => 1);
      assertGaugeValue(collectingReporter, 'reqPerSecond', 1);

      gauge(3);
      assertGaugeValue(collectingReporter, 'reqPerSecond', 3);
    });
  });

  describe('histogram', () => {
    it('should create a new histogram', () => {
      const collectingReporter = aReporter();
      const metrics = aMetrics(collectingReporter);

      metrics.hist('reqPerSecond')(1);
      assertHistInvocations(collectingReporter, 'reqPerSecond', 1);
    });

    it('should reuse same meter from registry for subsequent invocations', () => {
      const collectingReporter = aReporter();
      const metrics = aMetrics(collectingReporter);
      const hist = metrics.hist('reqPerSecond');

      hist(1);
      hist(12);
      assertHistInvocations(collectingReporter, 'reqPerSecond', 2);
    });
  });

  describe('collection', () => {

    it('should validate presence of at least 1 tag', () => {
      expect(() => aWixMeasured().collection()).to.throw('mandatory');
      expect(() => aWixMeasured().collection({})).to.throw('be a string');
    });

    it('should return a new measured instance with same key if prefix is not provided', () => {
      const collectingReporter = aReporter();
      const collection = aWixMeasured().addReporter(collectingReporter).collection('childKey', 'childValue');

      assertPrefixForMetrics('childKey=childValue', collection, collectingReporter);
    });

    it('should return a new measured instance with suffix added to parent prefix', () => {
      const collectingReporter = aReporter();
      const collection = aWixMeasured().addReporter(collectingReporter)
        .collection('parentKey', 'parentValue')
        .collection('childKey', 'childValue');

      assertPrefixForMetrics('parentKey=parentValue.childKey=childValue', collection, collectingReporter);
    });
  });
});

function assertPrefixForMetrics(prefix, metrics, collector) {
  metrics.meter('reqPerSecond')(1);

  expect(collector.meters((prefix === '' ? '' : prefix + '.'))).to.not.be.undefined;
}

function assertMeterCountValue(reporter, name, expectedValue) {
  expect(reporter.meters('meter=' + name).toJSON().count).to.equal(expectedValue);
}

function assertMeterRateValue(reporter, name, expectedRange) {
  expect(reporter.meters('meter=' + name).toJSON()['1MinuteRate']).to.be.within(expectedRange.from, expectedRange.to);
}

function assertGaugeValue(reporter, name, expectedValue) {
  expect(reporter.gauges('gauge=' + name).toJSON()).to.equal(expectedValue);
}

function assertHistInvocations(reporter, name, count) {
  expect(reporter.hists('hist=' + name).toJSON().count).to.equal(count);
}

function aMetrics(reporter, host, app) {
  return aWixMeasured(host, app).addReporter(reporter).collection('key', 'value');
}

function aReporter() {
  return new FilteringReporter();
}


class FilteringReporter {
  addTo(measured) {
    this._measured = measured;
  }

  meters(key) {
    return this._findKeyIn(this._measured.meters, key);
  }

  gauges(key) {
    return this._findKeyIn(this._measured.gauges, key);
  }

  hists(key) {
    return this._findKeyIn(this._measured.hists, key);
  }

  _findKeyIn(where, keyPart) {
    const matchedKey = Object.keys(where).find(el => el.indexOf(keyPart) > -1);
    if (matchedKey) {
      return where[matchedKey];
    }
  }
}

function aWixMeasured(host = 'local', app = 'app') {
  return new Factory(host, app);
}
