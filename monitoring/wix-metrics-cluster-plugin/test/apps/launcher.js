'use strict';
var app = require('./app'),
  wixClusterBuilder = require('wix-cluster').builder,
  wixMetricsPlugin = require('../../lib/wix-metrics-cluster-plugin').plugin();

wixClusterBuilder(app)
  .addPlugin(wixMetricsPlugin)
  .withWorkerCount(1)
  .start();