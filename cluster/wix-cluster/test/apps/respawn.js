'use strict';
var app = require('./index'),
    wixClusterBuilder = require('../../lib/wix-cluster').builder,
    respawner = require('../../lib/plugins/cluster-respawner'),
    testNotifier = require('./parent-notifier-plugin');

wixClusterBuilder(app)
  .withoutDefaultPlugins()
  .withWorkerCount(process.env.workerCount)
  .addPlugin(testNotifier())
  .addPlugin(respawner())
  .start();