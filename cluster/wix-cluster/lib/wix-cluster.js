'use strict';
const cluster = require('cluster'),
  log = require('wnp-debug')('wix-cluster'),
  runApp = require('./app-runner'),
  WixMeasured = require('wix-measured'),
  StatsDAdapter = require('wix-measured-statsd-adapter'),
  StatsD = require('node-statsd'),
  eventLoop = require('./meter/event-loop').loop,
  memoryUsage = require('./meter/memory-usage').usage;

module.exports.run = (appFunction, opts) => {
  const workerCount = opts && opts.workerCount || 2;
  const statsRefreshInterval = opts && opts.statsRefreshInterval || 10000;
  const metrics = new WixMeasured(opts && opts.metrics || {});
  let shutdownAppFn = () => {
  };

  const StatsDActivator = require('./plugins/statsd-activator');
  const MasterStats = require('./plugins/master-stats');
  const WorkerStats = require('./plugins/worker-stats');

  const plugins = [
    require('./plugins/logger')(),
    new MasterStats(
      metrics.collection({process: 'master'}),
      eventLoop,
      memoryUsage
    ),
    new WorkerStats(
      metrics.collection({process: 'worker'}),
      eventLoop,
      memoryUsage,
      process
    ),
    new StatsDActivator(metrics, StatsDAdapter, StatsD, log),
    require('./plugins/respawner')(),
    require('./plugins/error-handler')(process, () => shutdownAppFn()),
    require('./plugins/worker-notifier')(process, statsRefreshInterval)
  ];

  if (cluster.isMaster) {
    return Promise.resolve().then(() => {
      plugins.forEach(plugin => plugin.onMaster(cluster));
      for (let i = 0; i < workerCount; i++) {
        cluster.fork();
      }
    });
  } else {
    return Promise.resolve().then(() => {
      plugins.forEach(plugin => plugin.onWorker(cluster.worker));
      return runApp(appFunction, stop => shutdownAppFn = stop);
    }).catch(e => {
      log.error('Failed to start worker:', e);
      return Promise.reject(e);
    });
  }
};