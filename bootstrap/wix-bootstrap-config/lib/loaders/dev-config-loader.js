'use strict';
const Loader = require('./config-loader'),
  develConfig = require('../../configs/development-config'),
  _ = require('lodash'),
  log = require('wix-logger').get('wix-bootstrap-config');

class DevConfigLoader {
  constructor(configName) {
    this.loader = new Loader(configName);
  }

  load(configObject) {
    let res;
    try {
      res = this.loader.load(configObject);
    } catch (e) {
      log.debug('DEV mode detected and config file is missing, preloading stub values: ' + JSON.stringify(develConfig));
      res = _.merge(_.clone(develConfig, true), configObject || {});
    }

    return res;
  }
}

module.exports = DevConfigLoader;

