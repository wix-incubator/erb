'use strict';
const _ = require('lodash');

module.exports.basic = obj => _.merge({}, basicEnv(), obj || {});
module.exports.bootstrap = obj => _.merge({}, bootstrapEnv(), obj || {});
function basicEnv() {
  const port = _.random(3000, 3996);
  return {
    PORT: port,
    MOUNT_POINT: '/app',
    APP_NAME: 'app',
    MANAGEMENT_PORT: port + 4,
    APP_PERSISTENT_DIR: './target/persistent'
  };
}

function bootstrapEnv() {
  return {
    PORT: 3000,
    MANAGEMENT_PORT: 3004,
    MOUNT_POINT: '',
    APP_NAME: 'app',
    APP_CONF_DIR: './target/configs',
    APP_LOG_DIR: './target/logs',
    APP_PERSISTENT_DIR: './target/persistent',
    APP_TEMPL_DIR: './templates',
    HOSTNAME: 'localhost',
    NEW_RELIC_ENABLED: false,
    NEW_RELIC_NO_CONFIG_FILE: true,
    NEW_RELIC_LOG: 'stdout',
    DEBUG: 'wnp:*,wix:*'
  };
}