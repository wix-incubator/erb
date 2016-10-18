'use strict';
const runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wnp-bootstrap-session'),
  sessionCrypto = require('wix-session-crypto'),
  session = require('./lib/wnp-bootstrap-session');

const sessionConfigName = 'wnp-bootstrap-session';
const newSessionConfigName = 'wnp-bootstrap-session2.pub';

const envVariableSession = 'WIX_BOOT_SESSION_KEY';
const envVariableSession2 = 'WIX_BOOT_SESSION2_KEY';

module.exports.di = {
  key: 'session',
  value: loadSessionCrypto,
  deps: ['config']
};

function loadSessionCrypto(context) {
  if (context.env[envVariableSession] && context.env[envVariableSession2]) {
    log.debug(`env variables '${envVariableSession}', '${envVariableSession2}' set, skipping loading from config.`);
    return session(context.env[envVariableSession], context.env[envVariableSession2]);
  } else if (runMode.isProduction()) {
    log.debug(`production mode detected, loading session keys from configs: '${context.env.APP_CONF_DIR}/${sessionConfigName}.json.erb', '${context.env.APP_CONF_DIR}/${newSessionConfigName}.pub.erb'`);
    const keys = loadKeys(context.config);
    return session(keys.sessionKey, keys.session2Key);
  } else {
    log.debug(`dev mode detected, using session keys: '${sessionCrypto.v1.devKey}', '${sessionCrypto.v2.devKey}'`);
    return session(sessionCrypto.v1.devKey, sessionCrypto.v2.devKey);
  }
}

function loadKeys(configLoader) {
  return {
    sessionKey: configLoader.json(sessionConfigName).session.mainKey,
    session2Key: configLoader.text(newSessionConfigName)
  };
}