'use strict';
const _ = require('lodash'),
  devConfig = require('../../configs/development-config');

module.exports.without = without;
module.exports.withValue = withValue;
module.exports.valid = valid;

function without(prop) {
  const conf = valid();
  _.set(conf, prop, undefined);
  return conf;
}

function withValue(prop, value) {
  return _.set(valid(), prop, value);
}

function valid() {
  return _.cloneDeep(devConfig);
}