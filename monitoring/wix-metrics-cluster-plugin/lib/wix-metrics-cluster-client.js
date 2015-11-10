'use strict';
const exchange = require('wix-cluster-exchange');

module.exports.wixExpressMonitorCallback = wixExpressMonitorCallback;

const client = exchange.client('wix-metrics');

/**
 * @param metrics - a metrics object from the wix-express-monitor library
 */
function wixExpressMonitorCallback(metrics) {
  client.send({operationStats: metrics});
}
