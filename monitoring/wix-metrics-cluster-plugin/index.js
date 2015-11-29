'use strict';
module.exports.clusterPlugin = require('./lib/wix-metrics-cluster-plugin').plugin;
module.exports.managementPlugin = require('./lib/stats-management-plugin').router;
module.exports.wixExpressMonitorCallback = require('./lib/wix-metrics-cluster-client').wixExpressMonitorCallback;