const constants = require('./constants');

function loadConfiguration({env, config, log}) {
  return {
    host: loadHost(env, config, log),
    interval: loadInterval(env, log)
  };
}

function loadHost(env, config, log) {
  if (env[constants.envVariableHost]) {
    log.debug(`env variable '${constants.envVariableHost}' set, skipping loading from config`);
    return env[constants.envVariableHost];
  } else if (isProduction(env)) {
    log.debug(`production mode detected, loading statsd host from config: '${env.APP_CONF_DIR}/${constants.configName}'`);
    return config.json(constants.configName).statsd.host;
  } else {
    log.debug('dev mode detected, using statsd host: \'localhost\'');
    return 'localhost';
  }
}

function loadInterval(env, log) {
  if (env[constants.envVariableInterval]) {
    log.debug(`env variable '${constants.envVariableInterval}' set, using it`);
    return env[constants.envVariableInterval];
  } else {
    log.debug(`no environment variable ${constants.envVariableInterval} set, setting interval to: '${constants.interval}'`);
    return constants.interval;
  }
}

function isProduction(env) {
  return env['NODE_ENV'] === 'production';
}

module.exports = loadConfiguration;
