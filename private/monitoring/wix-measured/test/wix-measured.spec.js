'use strict';
const expect = require('chai').expect,
  WixMeasured = require('..');

describe('wix-measured', () => {

  it('should create instance with common prefix', () => {
    const collector = aReporter();
    const metrics = aMetrics(collector, {app_name: 'anApp'});

    assertPrefixForMetrics('app_name=anApp', metrics, collector);
  });

  it('should create instance without explicit prefix', () => {
    const collector = aReporter();
    const metrics = aMetrics(collector);

    assertPrefixForMetrics('', metrics, collector);
  });

  describe('meter', () => {

    it('should create a new meter', () => {
      const collector = aReporter();
      const metrics = aMetrics(collector);

      metrics.meter('reqPerSecond');
      assertMeterValue(collector, 'reqPerSecond', 1);
    });

    it('should reuse same meter from registry for subsequent invocations', () => {
      const collector = aReporter();
      const metrics = aMetrics(collector);

      metrics.meter('reqPerSecond');
      metrics.meter('reqPerSecond', 2);

      assertMeterValue(collector, 'reqPerSecond', 3);
    });
  });

  describe('gauge', () => {

    it('should create a new gauge', () => {
      const collector = aReporter();
      const metrics = aMetrics(collector);

      metrics.gauge('reqPerSecond', () => 1);
      assertGaugeValue(collector, 'reqPerSecond', 1);
    });

    it('should allow to override gauge', () => {
      const collector = aReporter();
      const metrics = aMetrics(collector);

      metrics.gauge('reqPerSecond', () => 1);
      assertGaugeValue(collector, 'reqPerSecond', 1);

      metrics.gauge('reqPerSecond', () => 3);
      assertGaugeValue(collector, 'reqPerSecond', 3);
    });
  });

  describe('histogram', () => {
    it('should create a new histogram', () => {
      const collector = aReporter();
      const metrics = aMetrics(collector);

      metrics.hist('reqPerSecond', 1);
      assertHistInvocations(collector, 'reqPerSecond', 1);
    });

    it('should reuse same meter from registry for subsequent invocations', () => {
      const collector = aReporter();
      const metrics = aMetrics(collector);

      metrics.hist('reqPerSecond', 1);
      metrics.hist('reqPerSecond', 12);
      assertHistInvocations(collector, 'reqPerSecond', 2);
    });
  });

  describe('collection', () => {

    it('should validate presence of at least 1 tag', () => {
      expect(() => new WixMeasured().collection()).to.throw('tags object with at least 1 tag must be provided');
      expect(() => new WixMeasured().collection({})).to.throw('tags object with at least 1 tag must be provided');
    });

    it('should return a new measured instance with same key if prefix is not provided', () => {
      const reporter = aReporter();
      const collection = new WixMeasured().addReporter(reporter).collection({
        childKey: 'childValue'
      });

      assertPrefixForMetrics('childKey=childValue', collection, reporter);
    });

    it('should return a new measured instance with suffix added to parent prefix', () => {
      const reporter = aReporter();
      const collection = new WixMeasured({parentKey: 'parentValue'}).addReporter(reporter).collection({
        childKey: 'childValue'
      });

      assertPrefixForMetrics('parentKey=parentValue.childKey=childValue', collection, reporter);
    });
  });
});

function assertPrefixForMetrics(prefix, metrics, collector) {
  metrics.meter('reqPerSecond');
  expect(collector.meters((prefix === '' ? '' : prefix + '.') + 'meter=reqPerSecond')).to.not.be.undefined;
}

function assertMeterValue(reporter, name, expectedValue) {
  expect(reporter.meters('meter=' + name).toJSON().count).to.equal(expectedValue);
}

function assertGaugeValue(reporter, name, expectedValue) {
  expect(reporter.gauges('gauge=' + name).toJSON()).to.equal(expectedValue);
}

function assertHistInvocations(reporter, name, count) {
  expect(reporter.hists('hist=' + name).toJSON().count).to.equal(count);
}

function aMetrics(reporter, tags) {
  return new WixMeasured(tags).addReporter(reporter);
}
function aReporter() {
  return new FilteringReporter();
}


class FilteringReporter {
  addTo(measured) {
    this._measured = measured;
  }

  meters(key) {
    return this._measured.meters[key];
  }

  gauges(key) {
    return this._measured.gauges[key];
  }

  hists(key) {
    return this._measured.hists[key];
  }
}