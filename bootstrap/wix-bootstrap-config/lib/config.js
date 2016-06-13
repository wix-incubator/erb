'use strict';
const runMode = require('wix-run-mode'),
  Loader = require('./loaders/config-loader'),
  DevLoader = require('./loaders/dev-config-loader'),
  defaults = require('../configs/defaults'),
  cluster = require('cluster'),
  sessionCrypto = require('wix-session-crypto');

const configName = module.exports.configName = 'wix-bootstrap';

module.exports.setup = confDir => require('wix-config').setup(confDir);

module.exports.load = config => {
  const configObject = config || {};
  let retConfig = {};
  if (runMode.isProduction()) {
    retConfig = new Loader(configName, defaults).load(configObject, cluster);
  } else {
    retConfig = new DevLoader(configName).load(configObject, cluster);
  }

  if (retConfig.session) {
    retConfig.session.newSessionKey = sessionCrypto.v2.devKey;
  }
  return retConfig;
};
