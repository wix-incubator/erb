'use strict';
const log = require('wnp-debug')('wnp-bootstrap-composer'),
  runMode = require('wix-run-mode');

const envKeysToDisable = {
  NEW_RELIC_ENABLED: false,
  NEW_RELIC_NO_CONFIG_FILE: true,
  NEW_RELIC_LOG: 'stdout'
};

module.exports.setup = () => {
  if (!runMode.isProduction()) {
    log.debug(`DEV mode detected, disabling new relic by setting env variables: ${Object.keys(envKeysToDisable).join()}`);
    Object.keys(envKeysToDisable).forEach(key => {
      process.env[key] = envKeysToDisable[key];
    });
  }
};

module.exports.get = () => require('newrelic');