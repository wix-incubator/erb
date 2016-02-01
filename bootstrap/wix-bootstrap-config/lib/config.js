'use strict';
const runMode = require('wix-run-mode'),
  Loader = require('./loaders/config-loader'),
  DevLoader = require('./loaders/dev-config-loader');

const configName = module.exports.configName = 'wix-bootstrap';

module.exports.load = config => {
  if (runMode.isProduction()) {
    return new Loader(configName).load(config);
  } else {
    return new DevLoader(configName).load(config);
  }
};

