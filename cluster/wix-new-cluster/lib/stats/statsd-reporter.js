'use strict';
const Statsd = require('node-statsd'),
  join = require('path').join,
  packageJson = require(join(process.cwd(), 'package.json'));

class StatsDReporter {
  constructor() {
    const host = (process.env.HOSTNAME || 'localhost').split('.').join('_');
    this._client = new Statsd({host: 'sensu01.aus.wixpress.com'});
    this._prefix = `root=app_info.app_name=${packageJson.name}.host=${host}`;
    this._gauges = [];
    this._rates = [];
    this._hists = [];
  }

  addGauge(gauge, name) {
    this._gauges.push({gauge, name});
  }

  addOneMinuteRate(rate, name) {
    this._rates.push({rate, name});
  }

  addHist(hist, name) {
    this._hists.push({hist, name});
  }

  start() {
    this._interval = setInterval(() => this._publish(), 30000);
    return this;
  }

  _publish() {
    this._gauges.forEach(el => {
      this._client.gauge(`${this._prefix}.tag=${el.name.tag}.stat=${el.name.stat}.gauge=${el.name.gauge}`, Math.round(el.gauge.toJSON()));
    });

    this._rates.forEach(el => {
      this._client.gauge(`${this._prefix}.tag=${el.name.tag}.stat=${el.name.stat}.rate=per-minute.m1_rate`, el.rate.toJSON()['1MinuteRate']);
    });

    this._hists.forEach(el => {
      const res = el.hist.toJSON();
      this._client.gauge(`${this._prefix}.tag=${el.name.tag}.stat=${el.name.stat}.measurement=ns.median`, Math.round(res.median));
      this._client.gauge(`${this._prefix}.tag=${el.name.tag}.stat=${el.name.stat}.measurement=ns.p75`, Math.round(res.p75));
      this._client.gauge(`${this._prefix}.tag=${el.name.tag}.stat=${el.name.stat}.measurement=ns.p95`, Math.round(res.p95));
      this._client.gauge(`${this._prefix}.tag=${el.name.tag}.stat=${el.name.stat}.measurement=ns.p99`, Math.round(res.p99));
    });
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._publish();
      this._interval = undefined;
    }
  }
}

module.exports = StatsDReporter;