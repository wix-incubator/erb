'use strict';
const runMode = require('wix-run-mode'),
  Loader = require('./loaders/config-loader'),
  DevLoader = require('./loaders/dev-config-loader'),
  defaults = require('../configs/defaults');

const configName = module.exports.configName = 'wix-bootstrap';

module.exports.load = config => {
  if (runMode.isProduction()) {
    return new Loader(configName, defaults).load(config);
  } else {
    return new DevLoader(configName).load(config);
  }
};

