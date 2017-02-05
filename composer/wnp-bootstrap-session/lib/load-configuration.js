const sessionCrypto = require('wix-session-crypto');

const sessionConfigName = 'wnp-bootstrap-session.json';
const session2ConfigName = 'wnp-bootstrap-session2.pub';

const envVariableSession = 'WIX_BOOT_SESSION_KEY';
const envVariableSession2 = 'WIX_BOOT_SESSION2_KEY';

function loadConfiguration({env, config, log}) {
  if (env[envVariableSession] && env[envVariableSession2]) {
    log.debug(`env variables '${envVariableSession}', '${envVariableSession2}' set, skipping loading from config.`);
    return {
      sessionKey: env[envVariableSession],
      session2Key: env[envVariableSession2]
    };
  } else if (isProduction(env)) {
    log.debug(`production mode detected, loading session keys from configs: '${env.APP_CONF_DIR}/${sessionConfigName}', '${env.APP_CONF_DIR}/${session2ConfigName}'`);
    return {
      sessionKey: config.json(sessionConfigName).session.mainKey,
      session2Key: config.text(session2ConfigName)
    };
  } else {
    log.debug(`dev mode detected, using session keys: '${sessionCrypto.v1.devKey}', '${sessionCrypto.v2.devKey}'`);
    return {
      sessionKey: sessionCrypto.v1.devKey,
      session2Key: sessionCrypto.v2.devKey
    };
  }
}

function isProduction(env) {
  return env['NODE_ENV'] === 'production';
}

module.exports = loadConfiguration;
