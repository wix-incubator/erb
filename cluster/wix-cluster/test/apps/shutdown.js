'use strict';
var app = require('./index'),
    wixClusterBuilder = require('../../lib/wix-cluster').builder,
    errorHandler = require('../../lib/plugins/cluster-error-handler'),
    testNotifier = require('./parent-notifier-plugin');

wixClusterBuilder(app)
  .withoutDefaultPlugins()
  .withWorkerCount(process.env.workerCount)
  .addPlugin(testNotifier())
  .addPlugin(errorHandler())
  .start();