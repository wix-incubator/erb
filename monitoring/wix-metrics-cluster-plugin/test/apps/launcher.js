'use strict';
var app = require('./app'),
  wixClusterBuilder = require('wix-cluster').builder,
  wixMetricsPlugin = require('../../lib/wix-metrics-cluster-plugin').plugin(),
  wixManagementStats = require('../../lib/stats-management-plugin').router(),
  testNotifierPlugin = require('wix-childprocess-testkit').testNotifierPlugin;

wixClusterBuilder(app)
  .addPlugin(wixMetricsPlugin)
  .addPlugin(testNotifierPlugin())
  .withManagementRouter(wixManagementStats)
  .withWorkerCount(1)
  .start();