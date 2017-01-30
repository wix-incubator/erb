const measured = require('measured'),
  sanitize = require('./sanitize'),
  assert = require('assert');

module.exports = class WixMeasured {
  constructor(prefix, registry) {
    this._prefix = prefix;
    this._registry = registry;
  }

  _name(type, name) {
    return [this._prefix, type + '=' + sanitize(name)].join('.');
  }

  meter(name) {
    const keyName = this._name('meter', name);
    const meter = new measured.Meter({rateUnit: 60000});
    this._registry._meters[keyName] = meter;
    return count => meter.mark(count || 1);
  }

  gauge(name) {
    const keyName = this._name('gauge', name);
    let value = () => 0;
    const gauge = new measured.Gauge(() => value() || 0);
    this._registry._gauges[keyName] = gauge;
    //TODO: make it safe for null values etc
    return (fnOrValue) => {
      if (fnOrValue instanceof Function) {
        value = fnOrValue;
      } else {
        value = () => fnOrValue;
      }
    }
  }

  hist(name) {
    const keyName = this._name('hist', name);
    const hist = new measured.Histogram();
    this._registry._hists[keyName] = hist;
    return value => value && hist.update(value);
  }

  collection(name, value) {
    assert(name && typeof name === 'string', 'name must be a string and is mandatory');
    assert(value && typeof value === 'string', 'value must be a string and is mandatory');
    
    const prefix = [this._prefix, `${sanitize(name)}=${sanitize(value)}`].join('.');
    return new WixMeasured(prefix, this._registry);
  }
};
