'use strict';
const runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wnp-bootstrap-session'),
  sessionCrypto = require('wix-session-crypto'),
  session = require('./lib/wnp-bootstrap-session');

const configName = 'wnp-bootstrap-session';
const envVariableMain = 'WIX-BOOT-SESSION-MAIN-KEY';
const envVariableAlternate = 'WIX-BOOT-SESSION-ALTERNATE-KEY';

module.exports.configName = configName;

module.exports.di = {
  key: 'session',
  value: loadSessionCrypto,
  deps: ['config']
};

function loadSessionCrypto(context) {
  if (process.env[envVariableMain]) {
    log.debug(`env variable '${envVariableMain}' set, skipping loading from config.`);
    return session(process.env[envVariableMain], [envVariableAlternate]);
  } else if (runMode.isProduction()) {
    log.debug(`production mode detected, loading session keys from config: ${context.env.confDir}/${configName}.json.erb`);
    const sessionConfig = context.config.load(configName);
    return session(sessionConfig.session.mainKey, sessionConfig.session.alternateKey);
  } else {
    log.debug(`dev mode detected, using session key: '${sessionCrypto.devKeys.main}'`);
    return session(sessionCrypto.devKeys.main);
  }
}