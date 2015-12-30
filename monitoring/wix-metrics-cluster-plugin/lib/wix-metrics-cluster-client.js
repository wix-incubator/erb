'use strict';
const exchange = require('wix-cluster-exchange');
const client = exchange.client('wix-metrics');

module.exports.wixExpressMonitorCallback = wixExpressMonitorCallback;

/**
 * @param metrics - a metrics object from the wix-express-monitor library
 * expecting metrics of type
 * {
    operationName: [String],
    startTime: [ISO Date formatted string],
    timeToFirstByteMs: [Number],
    durationMs: [Number],
    timeout: [Boolean],
    errors: [Array<Error>]
  }
 */
function wixExpressMonitorCallback(metrics) {
  let stats = {
    operationName: metrics.operationName,
    startTime: metrics.startTime,
    timeToFirstByteMs: metrics.timeToFirstByteMs,
    durationMs: metrics.durationMs,
    timeout: metrics.timeout,
    errors: metrics.errors.map((err) => {
      return {name: err.name, stack: err.stack};
    })
  };
  client.send({operationStats: stats});
}
