'use strict';
require('./cluster-aware-newrelic.js').setup(require('cluster'));
require('./patch-promise.js').setup(require('bluebird'));
require('./env-augmentor').setup(require('wix-run-mode'), require('cluster'), process.env);
require('./env-validator').setup(process.env);
require('./config-setup').setup();
require('./unhandled-rejection-logger').setup();
