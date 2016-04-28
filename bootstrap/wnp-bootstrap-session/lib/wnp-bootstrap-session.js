'use strict';
const sessionCrypto = require('wix-session-crypto'),
  runMode = require('wix-run-mode'),
  logger = require('wix-logger').get('wnp-bootstrap-session');

const configName = 'wnp-bootstrap-session';

module.exports.configName = configName;

module.exports.di = {
  key: 'session',
  value: context => load(context.env, context.config),
  //TODO: validate
  deps: ['config']
};

function load(env, config) {
  if (runMode.isProduction() && process.env['WIX-BOOT-SESSION-MAIN-KEY']) {
    logger.debug('production mode detected, env variable \'WIX-BOOT-SESSION-MAIN-KEY\' set, skipping loading from config.');
    return sessionCrypto.get(process.env['WIX-BOOT-SESSION-MAIN-KEY'], ['WIX-BOOT-SESSION-ALTERNATE-KEY']);
  } else if (runMode.isProduction()) {
    logger.debug(`production mode detected, loading session keys from config: ${env.confDir}/${configName}.json.erb`);
    const sessionConfig = config.load(configName);
    return sessionCrypto.get(sessionConfig.session.mainKey, sessionConfig.session.alternateKey);
  } else {
    logger.debug(`dev mode detected, using session key: '${sessionCrypto.devKeys.main}'`);
    return sessionCrypto.get(sessionCrypto.devKeys.main);
  }
}