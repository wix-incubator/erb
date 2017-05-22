const constants = require('./constants'),
  os = require('os');

function loadConfiguration({env, config, artifactInfo, log}) {
  return {
    seenBy: loadSeenBy({env, config, artifactInfo, log}),
    publicStaticsUrl: loadPublicStaticsUrl({env, config, log})
  }
}

function loadSeenBy({env, config, artifactInfo, log}) {
  if (env[constants.envVariableSeenBy]) {
    log.debug(`env variable '${constants.envVariableSeenBy}' set, skipping loading from config.`);
    return env[constants.envVariableSeenBy];
  } else if (isProduction(env)) {
    log.debug(`production mode detected, loading seenBy from config: '${env.APP_CONF_DIR}/${constants.configName}'`);
    return config.json(constants.configName).requestContext.seenBy;
  } else {
    log.debug(`dev mode detected, using seenBy: '${constants.devSeenBy}'`);
    return `${os.hostname()}.${artifactInfo.name}`;
  }
}


function loadPublicStaticsUrl({env, config, log}) {
  if (env[constants.envVariablePublicStaticsUrl]) {
    log.debug(`env variable '${constants.envVariablePublicStaticsUrl}' set, skipping loading from config.`);
    return env[constants.envVariablePublicStaticsUrl];
  } else if (isProduction(env)) {
    log.debug(`production mode detected, loading publicStaticsUrl from config: '${env.APP_CONF_DIR}/${constants.configName}'`);
    return config.json(constants.configName).publicStaticsUrl;
  } else {
    log.debug(`dev mode detected, using publicStaticsUrl: '${constants.devPublicStaticsUrl}'`);
    return constants.devPublicStaticsUrl;
  }
}

function isProduction(env) {
  return env['NODE_ENV'] === 'production';
}

module.exports = loadConfiguration;
