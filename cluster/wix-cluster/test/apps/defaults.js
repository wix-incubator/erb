'use strict';
var app = require('./index'),
    wixClusterBuilder = require('../../lib/wix-cluster').builder,
    testNotifier = require('./parent-notifier-plugin');

wixClusterBuilder(app)
  .withWorkerCount(process.env.workerCount)
  .addPlugin(testNotifier())
  .start();