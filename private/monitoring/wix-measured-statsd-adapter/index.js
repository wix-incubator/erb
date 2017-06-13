const assert = require('assert');

const DEFAULT_INTERVAL_MS = 30000; 
  
module.exports = class WixMeasuredStatsdAdapter {
  constructor(statsd, {interval = DEFAULT_INTERVAL_MS} = {interval: DEFAULT_INTERVAL_MS}) {
    assert(statsd && typeof statsd === 'object' && typeof statsd.gauge === 'function', 'statsd is mandatory and must be a valid StatsD client');
    
    const intInterval = parseInt(interval);
    assert(intInterval && intInterval > 0, `reporting interval must be a valid positive number when provided [but was ${interval}]`);
    
    this._statsdClient = statsd;
    this._registries = [];

    this._interval = setInterval(() => this._send(), intInterval);
  }

  addTo(measuredRegistry) {
    this._registries.push(measuredRegistry);
    return this;
  }

  stop() {
    clearInterval(this._interval);
    this._send();
  }

  _send() {
    this._registries.forEach(registry => {
      this._sendGauges(registry.gauges);
      this._sendMeters(registry.meters);
      this._sendHists(registry.hists);
    });
  }

  _sendGauges(gauges = {}) {
    Object.keys(gauges).forEach(key => {
      //TODO: test toFixed
      const res = gauges[key].toJSON();
      if (res) {
        this._statsdClient.gauge(key, res.toFixed(2));
      }
    });
  }

  _sendMeters(meters = {}) {
    Object.keys(meters).forEach(key => {
      const meter = meters[key].toJSON();
      if (meter.count) {
        this._statsdClient.gauge(`${key}.samples`, meter.count);
        //TODO: test toFixed
        this._statsdClient.gauge(`${key}.m1_rate`, meter['1MinuteRate'].toFixed(2));
      }
    });
  }

  _sendHists(hists = {}) {
    Object.keys(hists).forEach(key => {
      const hist = hists[key].toJSON();
      if (hist.median) {
        //TODO: test toFixed
        this._statsdClient.gauge(`${key}.max`, hist.max.toFixed(2));
        this._statsdClient.gauge(`${key}.p50`, hist.median.toFixed(2));
        this._statsdClient.gauge(`${key}.p95`, hist.p95.toFixed(2));
        this._statsdClient.gauge(`${key}.p99`, hist.p99.toFixed(2));
        this._statsdClient.gauge(`${key}.p999`, hist.p999.toFixed(2));
      }
    });
  }
};
