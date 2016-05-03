'use strict';
const runMode = require('wix-run-mode'),
  logger = require('wix-logger').get('wix-bootstrap-rpc');

const configName = 'wix-bootstrap-rpc';

module.exports.configName = configName;

module.exports.di = {
  key: 'rpc',
  value: (context, opts) => rpcFactory(context, opts),
  deps: ['session', 'config']
};

function rpcFactory(context, opts) {
  const effectiveOptions = defaults(opts);
  if (runMode.isProduction() && process.env['WIX-BOOT-RPC-SIGNING-KEY']) {
    effectiveOptions.rpcSigningKey = process.env['WIX-BOOT-RPC-SIGNING-KEY'];
    logger.debug('production mode detected, env variable \'WIX-BOOT-RPC-SIGNING-KEY\' set, skipping loading from config.');
  } else if (runMode.isProduction()) {
    effectiveOptions.rpcSigningKey = context.config.load(configName).rpc.signingKey;
    logger.debug(`production mode detected, loading rpc signing key from config: ${context.env.confDir}/${configName}.json.erb`);
  } else {
    effectiveOptions.rpcSigningKey = require('wix-rpc-client-support').devSigningKey;
    logger.debug(`dev mode detected, using rpc signing key: '${effectiveOptions.rpcSigningKey}'`);
  }
  return require('./lib/wix-bootstrap-rpc')(context, effectiveOptions);
}

function defaults(opts) {
  const options = opts || {};
  if (!options.timeout) {
    options.timeout = 6000;
  }
  return options;
}