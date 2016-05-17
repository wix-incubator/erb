'use strict';
const _ = require('lodash');

module.exports.setup = _.once(setup);

function setup() {
  require('./env-augmentor').setup(require('wix-run-mode'), require('cluster'), process.env);
  require('./env-validator').setup(process.env);
  require('./cluster-aware-newrelic.js').setup(require('cluster'));
  require('wix-patch-server-response').patch();
}