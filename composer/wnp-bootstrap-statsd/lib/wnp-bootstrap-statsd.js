'use strict';
const StatsD = require('node-statsd'),
  MeasuredStatsd = require('wix-measured-statsd-adapter'),
  loadConfig = require('./load-config'),
  runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wnp-bootstrap-statsd'),
  clusterClient = require('wix-cluster-client')();

module.exports = (context) => {
  const config = loadConfig(context.env, context.config, log, runMode);
  const adapter = new MeasuredStatsd(new StatsD({host: config.host}), {interval: config.interval});
  context.metrics.addReporter(adapter);
  context.management.addShutdownHook('StatsDAdapter', () => adapter.stop());
  clusterClient.configureStatsD({
    host: config.host,
    interval: config.interval
  });
};
