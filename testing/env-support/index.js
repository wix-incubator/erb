const {BOOTSTRAP, BOOTSTRAP_MANAGEMENT} = require('wix-test-ports');

module.exports.basic = obj => Object.assign(basicEnv(), obj);
module.exports.bootstrap = obj => Object.assign(bootstrapEnv(), obj);

function basicEnv() {
  return {
    PORT: BOOTSTRAP,
    MANAGEMENT_PORT: BOOTSTRAP_MANAGEMENT,
    MOUNT_POINT: '/app',
    APP_NAME: 'app',
    APP_PERSISTENT_DIR: './target/persistent'
  };
}

function bootstrapEnv() {
  return {
    PORT: BOOTSTRAP,
    MANAGEMENT_PORT: BOOTSTRAP_MANAGEMENT,
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
    DEBUG: 'wix:*',
    DEBUG_COLORS: true,
  };
}
