const gatekeeper = require('./lib/wix-bootstrap-gatekeeper'),
  extractUrl = require('./lib/extract-gatekeeper-url'),
  runMode = require('wix-run-mode'),
  configName = require('./lib/static-values').configName,
  middlewareFactory = require('./lib/wix-bootstrap-gatekeeper-middleware');

module.exports.configName = configName;

module.exports.di = {
  key: 'gatekeeper',
  value: gatekeeperFactory,
};

function gatekeeperFactory(context) {
  const clientFactory = gatekeeper(context.rpc, extractUrl(context, runMode.isProduction()));
  const client = aspects => clientFactory.client(aspects);
  const middleware = middlewareFactory.middleware(client);
  return {client, middleware};
}
