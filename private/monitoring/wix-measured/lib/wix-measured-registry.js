const sanitize = require('./sanitize'),
  assert = require('assert');

module.exports = class WixMeasuredRegistry {
  constructor({prefix, meters = {}, hists = {}, gauges = {}}) {
    assert(prefix, 'prefix is mandatory');
    this._prefix = prefix;
    this._meters = meters;
    this._gauges = gauges;
    this._hists = hists;
  };

  get prefix() {
    return this._prefix;
  }

  get meters() {
    return this._meters;
  }

  get gauges() {
    return this._gauges;
  }

  get hists() {
    return this._hists;
  }

  addMeter(key, name, meter) {
    return this._addMetricTo(this._meters, key, name, meter);
  }

  addGauge(key, name, gauge) {
    return this._addMetricTo(this._gauges, key, name, gauge);
  }

  addHist(key, name, hist) {
    return this._addMetricTo(this._hists, key, name, hist);
  }

  forCollection(key, name) {
    return new WixMeasuredRegistry({
      prefix: this._metricKey(key, name),
      meters: this._meters,
      hists: this._hists,
      gauges: this._gauges});
  }

  _addMetricTo(collection, key, name, value) {
    assert(value, 'metric is mandatory');

    collection[this._metricKey(key, name)] = collection[this._metricKey(key, name)] || value;
    return collection[this._metricKey(key, name)];
  }

  _metricKey(key, name) {
    assert(key && typeof key === 'string', 'key must be a string and is mandatory');
    assert(name && typeof name === 'string', 'name must be a string and is mandatory');

    return [this._prefix, `${sanitize(key)}=${sanitize(name)}`].join('.');
  }
};
