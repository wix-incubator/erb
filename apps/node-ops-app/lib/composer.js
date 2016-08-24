'use strict';
const host = process.env.NODE_ENV && process.env.NODE_ENV === 'production' ? 'metrics.wixpress.com' : 'metrics.wixpress.com';
require('appmetrics-statsd').StatsD(
  '', host, 62003, 'root=app_info.app_name=node-ops-app');

const Composer = require('wnp-bootstrap-composer').Composer;

module.exports = opts => new BootstrapNg(opts);

class BootstrapNg extends Composer {
  constructor(opts) {
    super(composerOptions(opts|| {}));
    super.use(require('wnp-bootstrap-config'));
  }

  start(opts) {
    const options = {};

    if (opts) {
      options.env = opts.env;

      if (opts.disableCluster && opts.disableCluster === true) {
        options.disable = ['runner'];
      }
    }

    return super.start(options);
  }
}

function composerOptions(opts) {
  return {
    runner: () => require('./runner'),
    composers: {
      mainExpress: () => require('./express-composer')(opts.express),
      managementExpress: () => require('wnp-bootstrap-management')
    }
  }
}
