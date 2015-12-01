'use strict';
const fs = require('fs'),
  path = require('path'),
  validate = require('./config-validator').validate,
  _ = require('lodash');

const configName = 'wix-bootstrap.json';

module.exports.configName = configName;

module.exports.load = config => {
  let conf = config || {};
  let validationResult = validate(conf);

  if (validationResult) {
    try {
      const file = fs.readFileSync(path.join(process.env.APP_CONF_DIR, configName));
      _.merge(conf, JSON.parse(file));
      validationResult = validate(conf);
    } catch (e) {
      throw new Error(`Failed to load config from \'APP_CONF_DIR/${configName}\` - is it there?`);
    }


  }

  if (validationResult) {
    throw validationResult;
  } else {
    return conf;
  }
};