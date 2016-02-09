'use strict';
const _ = require('lodash'),
  log = require('wix-logger').get('wix-bootstrap');

module.exports.setup = (runMode, cluster, env) => {
  const injected = {};
  if (!runMode.isProduction()) {
    _.forOwn(defaults(), (value, key) => {
      if (!_.has(env, key)) {
        injected[key] = value;
        env[key] = value;
      }
    });

    if (cluster.isMaster && Object.keys(injected).length > 0) {
      log.debug(`DEV mode detected and required env variables are missing, pre-loading stub values: ${JSON.stringify(injected)}`);
    }
  }
};

function defaults() {
  return {
    PORT: 3000,
    MANAGEMENT_PORT: 3004,
    MOUNT_POINT: '',
    APP_CONF_DIR: './test/configs',
    NEW_RELIC_ENABLED: false,
    NEW_RELIC_NO_CONFIG_FILE: true,
    NEW_RELIC_LOG: 'stdout'
  };
}