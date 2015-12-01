'use strict';
const _ = require('lodash');

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
  return {
    express: {
      requestTimeout: 1000
    },
    session: {
      mainKey: 'kukuriku_1111111'
    },
    rpc: {
      signingKey: '1234567890',
      defaultTimeout: 6000
    }
  };
}