const WixMeasured = require('./lib/wix-measured'),
  sanitize = require('./lib/tags').sanitize,
  assert = require('assert');

module.exports = class WixMeasuredWrapper extends WixMeasured {
  constructor(host, appName) {
    assert(host && typeof host === 'string', 'host must be a string and is mandatory');
    assert(appName && typeof appName === 'string', 'appName must be a string and is mandatory');
    super({prefix: `root=node_app_info.host=${sanitize(host)}.app_name=${sanitize(appName)}`});
  }
};
