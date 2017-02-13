const wixRpcClientSupport = require('wix-rpc-client-support'),
  constants = require('./constants');

function loadConfiguration({env, config, timeout, log}) {
  const res = configuration(timeout || constants.defaultTimeout);
  if (env[constants.envVariable]) {
    log.debug(`env variable '${constants.envVariable}' set, skipping loading from config.`);
    return res(env[constants.envVariable]);
  } else if (isProduction(env)) {
    log.debug(`production mode detected, loading session keys from config: '${env.APP_CONF_DIR}/${constants.configName}'`);
    return res(config.json(constants.configName).rpc.signingKey);
  } else {
    log.debug(`dev mode detected, using session key: '${wixRpcClientSupport.devSigningKey}'`);
    return res(wixRpcClientSupport.devSigningKey);
  }
}

function isProduction(env) {
  return env['NODE_ENV'] === 'production';
}

function configuration(timeout) {
  return signingKey => {
    return {signingKey, timeout};
  }
}

module.exports = loadConfiguration;