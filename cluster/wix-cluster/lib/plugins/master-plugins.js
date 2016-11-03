const log = require('wnp-debug')('wix-cluster'),
  WixMeasured = require('wix-measured'),
  StatsDAdapter = require('wix-measured-statsd-adapter'),
  StatsD = require('node-statsd'),
  eventLoop = require('../meter/event-loop').loop,
  memoryUsage = require('../meter/memory-usage').usage;

module.exports = opts => {
  const metricsConf = opts.metrics;
  const statsRefreshInterval = opts.statsRefreshInterval;
  const metrics = new WixMeasured(metricsConf);
  const masterMetrics = metrics.collection({process: 'master'});
  const workerMetrics = metrics.collection({process: 'worker'});
  const context = {
    log,
    eventLoop,
    memoryUsage,
    metrics,
    masterMetrics,
    StatsD,
    StatsDAdapter,
    workerMetrics,
    statsRefreshInterval
  };

  return [
    require('./error-handler'),
    require('./logger'),
    require('./master-stats'),
    require('./respawner'),
    require('./statsd-activator'),
    require('./worker-notifier'),
    require('./worker-stats'),
  ].map(plugin => plugin.master(context));
};