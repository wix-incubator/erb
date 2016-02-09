'use strict';
const _ = require('lodash'),
  log = require('wix-logger').get('wix-bootstrap-config'),
  validator = require('../config-validator'),
  Loader = require('./config-loader'),
  develDefaults = require('../../configs/development-config');

class DevConfigLoader {
  constructor(configName) {
    this.loader = new Loader(configName, develDefaults);
  }

  load(configObject, cluster) {
    let res;
    try {
      res = this.loader.load(configObject);
    } catch (e) {
      if (cluster.isMaster) {
        log.debug('DEV mode detected and config file is missing, preloading stub values: ' + JSON.stringify(develDefaults));
      }
      res = _.merge(_.clone(develDefaults, true), configObject || {});
    }

    validator.validate(res);

    return validator.validate(res);
  }
}

module.exports = DevConfigLoader;

