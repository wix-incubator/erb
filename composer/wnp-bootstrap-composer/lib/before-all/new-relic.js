'use strict';
const envKeysToDisable = {
  NEW_RELIC_ENABLED: false,
  NEW_RELIC_NO_CONFIG_FILE: true,
  NEW_RELIC_LOG: 'stdout'
};

module.exports = (runMode, env, log, newRelicInit) => {
  if (!runMode.isProduction()) {
    log.debug(`DEV mode detected, disabling new relic by setting env variables: ${Object.keys(envKeysToDisable).join()}`);
    Object.keys(envKeysToDisable).forEach(key => {
      env[key] = envKeysToDisable[key];
    });
  }
  newRelicInit();
};