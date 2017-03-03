const {devKey} = require('wix-session-crypto');
const session2ConfigName = 'wnp-bootstrap-session2.pub';

// const envVariableSession = 'WIX_BOOT_SESSION_KEY';
const envVariableSession2 = 'WIX_BOOT_SESSION2_KEY';

function loadConfiguration({env, config, log}) {
  if (env[envVariableSession2]) {
    log.debug(`env variable '${envVariableSession2}' set, skipping loading from config.`);
    return env[envVariableSession2];
  } else if (isProduction(env)) {
    log.debug(`production mode detected, loading session key from config: '${env.APP_CONF_DIR}/${session2ConfigName}'`);
    return config.text(session2ConfigName);
  } else {
    log.debug(`dev mode detected, using session key: '${devKey}'`);
    return devKey;
  }
}

function isProduction(env) {
  return env['NODE_ENV'] === 'production';
}

module.exports = loadConfiguration;
