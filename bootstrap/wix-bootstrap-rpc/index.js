'use strict';
const runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wix-bootstrap-rpc');

const configName = 'wix-bootstrap-rpc';
const envVariable = 'WIX_BOOT_RPC_SIGNING_KEY';
const defaultTimeout = 6000;

module.exports.configName = configName;

module.exports.di = {
  key: 'rpc',
  value: rpcFactory,
  deps: ['config', 'session']
};

function rpcFactory(context, opts) {
  const effectiveOptions = defaults(opts);
  if (context.env[envVariable]) {
    effectiveOptions.rpcSigningKey = context.env[envVariable];
    log.debug('env variable \'WIX_BOOT_RPC_SIGNING_KEY\' set, skipping loading from config');
  } else if (runMode.isProduction()) {
    effectiveOptions.rpcSigningKey = context.config.load(configName).rpc.signingKey;
    log.debug(`production mode detected, loading rpc signing key from config: ${context.env.APP_CONF_DIR}/${configName}.json.erb`);
  } else {
    effectiveOptions.rpcSigningKey = require('wix-rpc-client-support').devSigningKey;
    log.debug(`dev mode detected, using rpc signing key: '${effectiveOptions.rpcSigningKey}'`);
  }
  return require('./lib/wix-bootstrap-rpc')( context.env.hostname, effectiveOptions);
}

function defaults(opts) {
  const options = opts || {};
  if (!options.timeout) {
    options.timeout = defaultTimeout;
  }
  return options;
}