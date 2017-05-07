const constants = require('./constants');

function loadConfiguration({env, config, log}) {
  if (env[constants.envVariable]) {
    log.debug(`env variable '${constants.envVariable}' set, skipping loading from config.`);
    return env[constants.envVariable];
  } else if (isProduction(env)) {
    log.debug(`production mode detected, loading petri url from config: '${env.APP_CONF_DIR}/${constants.configName}'`);
    return config.json(constants.configName).services.petri;
  } else {
    log.debug(`dev mode detected, using petri url: '${constants.devUrl}'`);
    return constants.devUrl;
  }
}

function isProduction(env) {
  return env['NODE_ENV'] === 'production';
}

module.exports = loadConfiguration;