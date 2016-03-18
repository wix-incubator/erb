'use strict';
require('./cluster-aware-newrelic.js').setup(require('cluster'));

const cluster = require('cluster'),
  runMode = require('wix-run-mode'),
  bluebird = require('bluebird');

require('./patch-promise.js').setup(bluebird);
require('./env-augmentor').setup(runMode, cluster, process.env);
require('./env-validator').setup(process.env);
require('./config-setup');
require('./cluster-aware-logger').setup(cluster);
