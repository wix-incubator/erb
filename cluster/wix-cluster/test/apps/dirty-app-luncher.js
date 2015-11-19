'use strict';
var app = require('./dirty-app'),
    wixClusterBuilder = require('../../lib/wix-cluster').builder,
    testNotifier = require('./parent-notifier-plugin');

wixClusterBuilder(app)
  .withWorkerCount(process.env.workerCount)
  .addPlugin(testNotifier())
  .start();