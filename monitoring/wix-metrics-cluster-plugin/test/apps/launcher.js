'use strict';
var app = require('./app'),
  wixClusterBuilder = require('wix-cluster').builder,
  wixMetricsPlugin = require('../../').clusterPlugin(),
  wixManagementStats = require('../../').managementPlugin();

wixClusterBuilder(app)
  .addPlugin(wixMetricsPlugin)
  .withManagementRouter(wixManagementStats)
  .withWorkerCount(1)
  .start();