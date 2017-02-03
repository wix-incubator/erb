const gatekeeper = require('./lib/wix-bootstrap-gatekeeper'),
  extractUrl = require('./lib/extract-gatekeeper-url'),
  runMode = require('wix-run-mode'),
  configName = require('./lib/static-values').configName;

module.exports.configName = configName;

module.exports.di = {
  key: 'gatekeeper',
  value: gatekeeperClientFactory,
  deps: ['rpc', 'session']
};

function gatekeeperClientFactory(context) {
  return gatekeeper(context.rpc, extractUrl(context, runMode.isProduction()));
}
