const measured = require('measured');

module.exports = class WixMeasured {
  constructor(registry) {
    this._registry = registry;
  }

  meter(key, name) {
    const {resolvedKey, resolvedName} = resolveKeyName('meter', key, name);
    const meter = this._registry.addMeter(resolvedKey, resolvedName, new measured.Meter({rateUnit: 60000}));
    return count => meter.mark(count || 1);
  }

  gauge(key, name) {
    const {resolvedKey, resolvedName} = resolveKeyName('gauge', key, name);
    let value = () => 0;
    this._registry.addGauge(resolvedKey, resolvedName, new measured.Gauge(() => value() || 0));

    //TODO: make it safe for null values etc
    return (fnOrValue) => {
      if (fnOrValue instanceof Function) {
        value = fnOrValue;
      } else {
        value = () => fnOrValue;
      }
    }
  }

  hist(key, name) {
    const {resolvedKey, resolvedName} = resolveKeyName('hist', key, name);
    const hist = this._registry.addHist(resolvedKey, resolvedName, new measured.Histogram());
    return value => value && hist.update(value);
  }

  collection(key, name) {
    return new WixMeasured(this._registry.forCollection(key, name));
  }
};

function resolveKeyName(type, key, name) {
  return {resolvedKey: name ? key : type, resolvedName: name ? name : key};
}
