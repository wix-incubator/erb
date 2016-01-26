'use strict';
const validate = require('./config-validator').validate,
  _ = require('lodash'),
  wixConfig = require('wix-config');

const configName = 'wix-bootstrap.json';

module.exports.configName = configName;

module.exports.load = config => {
  let conf = config || {};
  let validationResult = validate(conf);

  if (validationResult) {
    try {
      _.merge(conf, wixConfig.load('wix-bootstrap'));
      validationResult = validate(conf);
    } catch (e) {
      throw new Error(`Failed to load config from \'APP_CONF_DIR/${configName}\' - is it there?`);
    }
  }

  if (validationResult) {
    throw validationResult;
  } else {
    return conf;
  }
};