const WixMeasured = require('./wix-measured'),
  sanitize = require('./sanitize'),
  assert = require('assert');

module.exports = class WixMeasuredFactory {
  constructor(host, appName) {
    assert(host && typeof host === 'string', 'host must be a string and is mandatory');
    assert(appName && typeof appName === 'string', 'appName must be a string and is mandatory');
    
    this._prefix = `root=node_app_info.host=${sanitize(host)}.app_name=${sanitize(appName)}`;
    this._meters = {};
    this._gauges = {};
    this._hists = {};
  }

  addReporter(reporter) {
    reporter.addTo({
      meters: this._meters,
      gauges: this._gauges,
      hists: this._hists
    });
    return this;
  }

  collection(name, value) {
    return new WixMeasured(this._prefix, this).collection(name, value);
  }
};
