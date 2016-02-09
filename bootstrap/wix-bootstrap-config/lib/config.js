'use strict';
const runMode = require('wix-run-mode'),
  Loader = require('./loaders/config-loader'),
  DevLoader = require('./loaders/dev-config-loader'),
  defaults = require('../configs/defaults'),
  cluster = require('cluster');

const configName = module.exports.configName = 'wix-bootstrap';

module.exports.setup = confDir => require('wix-config').setup(confDir);

module.exports.load = config => {
  const configObject = config || {};
  if (runMode.isProduction()) {
    return new Loader(configName, defaults).load(configObject, cluster);
  } else {
    return new DevLoader(configName).load(configObject, cluster);
  }
};
