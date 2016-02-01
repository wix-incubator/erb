'use strict';
const validate = require('../config-validator').validate,
  _ = require('lodash'),
  wixConfig = require('wix-config');

class ConfigLoader {
  constructor(configName) {
    this.configName = configName;
  }

  load(configObject) {
    let conf = configObject || {};
    let validationResult = validate(conf);

    if (validationResult) {
      try {
        _.merge(conf, wixConfig.load(this.configName));
        validationResult = validate(conf);
      } catch (e) {
        throw new Error(`Failed to load config from 'APP_CONF_DIR/${this.configName}.json' - is it there?`);
      }
    }

    if (validationResult) {
      throw validationResult;
    } else {
      return conf;
    }
  }
}

module.exports = ConfigLoader;

