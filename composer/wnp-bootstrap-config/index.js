'use strict';
const configLoader = require('./lib/wnp-bootstrap-config');

module.exports.di = {
  key: 'config',
  value: context => configLoader(context.env.confDir)
};
