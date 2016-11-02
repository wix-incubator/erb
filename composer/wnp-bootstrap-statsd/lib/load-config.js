'use strict';
const configName = 'wnp-bootstrap-statsd';
const envVariableHost = 'WIX_BOOTSTRAP_STATSD_HOST';
const envVariableInterval = 'WIX_BOOTSTRAP_STATSD_INTERVAL';

module.exports = (env, config, log, runMode) => {
  if (env[envVariableHost] && env[envVariableInterval]) {
    log.debug(`env variables '${envVariableHost}' and '${envVariableInterval}' set, skipping loading from config`);
    return {host: env[envVariableHost], interval: env[envVariableInterval]};
  } else if (runMode.isProduction()) {
    log.debug(`production mode detected, loading statsd host from config: ${env.APP_CONF_DIR}/${configName}.json.erb`);
    return config.json(configName).statsd;
  } else {
    log.debug('dev mode detected, using statsd host: \'localhost\'');
    return {host: 'localhost', interval: 5000};
  }
};