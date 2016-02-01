'use strict';
const validator = require('../config-validator'),
  _ = require('lodash'),
  wixConfig = require('wix-config');

class ConfigLoader {
  constructor(configName, defaults) {
    this.defaults = defaults;
    this.configName = configName;
  }

  load(configObject) {
    let conf = configObject || {};
    let validationResult = validate(conf);

    if (validationResult) {
      try {
        conf = _.merge(_.merge(_.clone(this.defaults, true), wixConfig.load(this.configName)), conf);
      } catch (e) {
        throw new Error(`Failed to load config from 'APP_CONF_DIR/${this.configName}.json' - is it there?`);
      }
    }

    return validator.validate(conf);
  }
}

function validate(conf) {
  try {
    validator.validate(conf);
  } catch (e) {
    return e;
  }
}

module.exports = ConfigLoader;