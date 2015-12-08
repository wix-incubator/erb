'use strict';
const chai = require('chai'),
  expect = chai.expect;

describe('wix measured', () => {

  describe('default collection', () => {

    const metrics = require('../').default;

    it('should support counters', () => {
      metrics.counter('name').inc(1);
      expect(metrics.toJSON().name).to.be.equal(1);
    });

    it('should support histogram', () => {
      metrics.histogram('h1').update(1);
      metrics.histogram('h1').update(2);
      metrics.histogram('h1').update(3);
      expect(metrics.toJSON().h1.count).to.be.equal(3);
      expect(metrics.toJSON().h1.min).to.be.equal(1);
      expect(metrics.toJSON().h1.max).to.be.equal(3);
      expect(metrics.toJSON().h1.p75).to.be.exist;
      expect(metrics.toJSON().h1.p95).to.be.exist;
      expect(metrics.toJSON().h1.p99).to.be.exist;
      expect(metrics.toJSON().h1.p999).to.be.exist;
      expect(metrics.toJSON().h1.median).to.be.exist;
    });

    it('should support gauge', () => {
      metrics.gauge('g1', () => 4);
      expect(metrics.toJSON().g1).to.be.equal(4);
    });

    it('should support meter', () => {
      metrics.meter('m1').mark();
      expect(metrics.toJSON().m1.mean).to.be.exist;
      expect(metrics.toJSON().m1.count).to.be.equal(1);
      expect(metrics.toJSON().m1.currentRate).to.be.exist;
      expect(metrics.toJSON().m1['1MinuteRate']).to.be.exist;
      expect(metrics.toJSON().m1['5MinuteRate']).to.be.exist;
      expect(metrics.toJSON().m1['15MinuteRate']).to.be.exist;
    });

    it('should support timer', () => {
      let stopwatch = metrics.timer('t1').start();
      stopwatch.end();
      expect(metrics.toJSON().t1.meter).to.be.exist;
      expect(metrics.toJSON().t1.histogram).to.be.exist;
    });
  });

  describe('alternate collection', () => {

    const metrics = require('../').default;
    const alternate = require('../').collection('alternate');

    it('should support counters', () => {
      alternate.counter('alt-c1').inc(1);
      var alternateStats = alternate.toJSON();
      expect(alternateStats.alternate['alt-c1']).to.be.exist;
      expect(alternateStats.alternate['alt-c1']).to.be.equal(1);
      expect(metrics.toJSON()['alt-c1']).to.be.undefined;
    });

    it('should support histogram', () => {
      alternate.histogram('alt-h1').update(1);
      alternate.histogram('alt-h1').update(2);
      alternate.histogram('alt-h1').update(3);
      expect(alternate.toJSON().alternate['alt-h1']).to.be.exist;
      expect(metrics.toJSON()['alt-h1']).to.be.undefined;
    });

    it('should support gauge', () => {
      alternate.gauge('alt-g1', () => 4);
      expect(alternate.toJSON().alternate['alt-g1']).to.be.equal(4);
      expect(metrics.toJSON()['alt-g1']).to.be.undefined;
    });

    it('should support meter', () => {
      alternate.meter('alt-m1').mark();
      expect(alternate.toJSON().alternate['alt-m1'].mean).to.be.exist;
      expect(alternate.toJSON().alternate['alt-m1'].count).to.be.equal(1);
      expect(alternate.toJSON().alternate['alt-m1'].currentRate).to.be.exist;
      expect(alternate.toJSON().alternate['alt-m1']['1MinuteRate']).to.be.exist;
      expect(alternate.toJSON().alternate['alt-m1']['5MinuteRate']).to.be.exist;
      expect(alternate.toJSON().alternate['alt-m1']['15MinuteRate']).to.be.exist;
      expect(metrics.toJSON()['alt-m1']).to.be.undefined;
    });

    it('should support timer', () => {
      let stopwatch = alternate.timer('alt-t1').start();
      stopwatch.end();
      expect(alternate.toJSON().alternate['alt-t1'].meter).to.be.exist;
      expect(alternate.toJSON().alternate['alt-t1'].histogram).to.be.exist;
      expect(metrics.toJSON()['alt-t1']).to.be.undefined;
    });
  });

});

