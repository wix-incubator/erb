'use strict';
const fs = require('fs'),
  join = require('path').join,
  _ = require('lodash');

const configs = {};

module.exports.get = name => {
  if (_.isEmpty(name)) {
    throw new Error('config name must be provided and cannot be empty');
  }

  if (!configs[name]) {
    if (!process.env.APP_CONF_DIR) {
      throw new Error('Environment variable "APP_CONF_DIR" is missing');
    }

    configs[name] = JSON.parse(fs.readFileSync(join(process.env.APP_CONF_DIR, `${name}.json`)));

  }
  return configs[name];
};
