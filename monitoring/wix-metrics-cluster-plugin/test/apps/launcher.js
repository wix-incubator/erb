'use strict';
var app = require('./app'),
  wixClusterBuilder = require('wix-cluster').builder,
  wixMetricsPlugin = require('../../').clusterPlugin(),
  wixManagementStats = require('../../').managementPlugin(),
  testNotifierPlugin = require('wix-childprocess-testkit').testNotifierPlugin;

wixClusterBuilder(app)
  .addPlugin(wixMetricsPlugin)
  .addPlugin(testNotifierPlugin())
  .withManagementRouter(wixManagementStats)
  .withWorkerCount(1)
  .start();