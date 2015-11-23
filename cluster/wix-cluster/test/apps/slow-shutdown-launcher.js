'use strict';
var app = require('./slow-shutdown-app'),
    wixClusterBuilder = require('../../lib/wix-cluster').builder,
    testNotifier = require('./parent-notifier-plugin');

wixClusterBuilder(app)
  .withWorkerCount(process.env.workerCount)
  .addPlugin(testNotifier())
  .start();