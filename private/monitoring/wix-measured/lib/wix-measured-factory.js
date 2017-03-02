const WixMeasured = require('./wix-measured'),
  WixMeasuredRegistry = require('./wix-measured-registry'),
  sanitize = require('./sanitize'),
  logger = require('wnp-debug')('wix-measured'),
  assert = require('assert');

module.exports = class WixMeasuredFactory {
  constructor(host, appName, log = logger) {
    assert(host && typeof host === 'string', 'host must be a string and is mandatory');
    assert(appName && typeof appName === 'string', 'appName must be a string and is mandatory');

    this._registry = new WixMeasuredRegistry({
      prefix: `root=node_app_info.host=${sanitize(host)}.app_name=${sanitize(appName)}`
    });
    this._log = log
  }

  addReporter(reporter) {
    reporter.addTo(this._registry);
    return this;
  }

  collection(key, name) {
    return new WixMeasured({registry: this._registry.forCollection(key, name), log: this._log});
  }
};
