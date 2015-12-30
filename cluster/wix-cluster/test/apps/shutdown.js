'use strict';
var app = require('./index'),
    wixCluster = require('../..'),
    errorHandler = require('../../lib/plugins/cluster-error-handler'),
    testNotifier = require('./parent-notifier-plugin');

wixCluster({
  app: app,
  workerCount: process.env.workerCount,
  withoutDefaultPlugins: true,
  plugins: [errorHandler(), testNotifier()]
}).start();