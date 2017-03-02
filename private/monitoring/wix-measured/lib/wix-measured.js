const measured = require('measured'),
  numericOrUndefined = require('./as-numeric');

module.exports = class WixMeasured {
  constructor({registry, log}) {
    this._registry = registry;
    this._log = log;
  }

  meter(key, name) {
    const {resolvedKey, resolvedName} = resolveKeyName('meter', key, name);
    const logKey = `${resolvedKey}=${resolvedName}`;
    const meter = this._registry.addMeter(resolvedKey, resolvedName, new measured.Meter({rateUnit: 60000}));

    return this._submitMetricFunction(logKey, numeric => meter.mark(numeric), 1);
  }

  gauge(key, name) {
    const {resolvedKey, resolvedName} = resolveKeyName('gauge', key, name);
    const logKey = `${resolvedKey}=${resolvedName}`;
    let value = () => 0;
    const gauge = new measured.Gauge(() => {
      const numericValue = numericOrUndefined(value());
      if (numericValue !== undefined) {
        return numericValue;
      } else {
        this._log.error(`submitted metric with key: ${logKey} and value: ${value} rejected as value is NaN`);
      }
    });
    this._registry.addGauge(resolvedKey, resolvedName, gauge);

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
    const logKey = `${resolvedKey}=${resolvedName}`;
    const hist = this._registry.addHist(resolvedKey, resolvedName, new measured.Histogram());

    return this._submitMetricFunction(logKey, numeric => hist.update(numeric), 0);
  }

  collection(key, name) {
    return new WixMeasured({registry: this._registry.forCollection(key, name), log: this._log});
  }

  _submitMetricFunction(logKey, submitFn, defaultValue) {
    return (value = defaultValue) => {
      const numericValue = numericOrUndefined(value);
      if (numericValue !== undefined) {
        submitFn(numericValue);
      } else {
        this._log.error(`submitted metric with key: ${logKey} and value: ${value} rejected as value is NaN`);
      }
    };
  }
};

function resolveKeyName(type, key, name) {
  return {resolvedKey: name ? key : type, resolvedName: name ? name : key};
}
