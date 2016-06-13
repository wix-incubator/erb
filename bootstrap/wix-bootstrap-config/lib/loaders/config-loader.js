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
      conf = _.merge({}, this.defaults, wixConfig.load(this.configName), conf);
      conf.session.newSessionKey = wixConfig.text('wix-bootstrap-session2.pub');
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