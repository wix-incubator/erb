'use strict';
const runMode = require('wix-run-mode'),
  cluster = require('cluster'),
  bluebird = require('bluebird');

require('./patch-promise.js').setup(bluebird);
require('./env-augmentor').setup(runMode, cluster, process.env);
require('./env-validator').setup(process.env);
require('./config-setup');
require('./cluster-aware-logger').setup(cluster);
require('./cluster-aware-newrelic.js').setup(cluster);