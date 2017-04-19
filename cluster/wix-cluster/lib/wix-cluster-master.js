const cluster = require('cluster'),
  engine = require('./engine'),
  log = require('wnp-debug')('wix-cluster'),
  ForkMeter = require('./engine/fork-meter'),
  DeathRow = require('./engine/death-row'),
  eventLoop = require('./meter/event-loop').loop,
  memoryUsage = require('./meter/memory-usage').usage,
  connectStatsD = require('./meter/connect-statsd'),
  StatsD = require('node-statsd'),
  StatsDAdapter = require('wix-measured-statsd-adapter'),
  WixMeasured = require('wix-measured'),
  sendToWorker = require('./send-to-worker');

module.exports = ({metrics, fallback, statsd} = {}) => {
  const metricsConf = metrics || {};
  let fallbackFunction = fallback || defaultFallback;

  const send = sendToWorker(log);
  const context = {cluster, deathRow: new DeathRow(), forkMeter: new ForkMeter(), currentProcess: process};
  const {masterMetrics, workerMetrics} = measured({
    appHost: metricsConf.app_host,
    appName: metricsConf.app_name,
    statsd
  });

  [
    require('./plugins/logger').master(log),
    require('./plugins/master-stats').master(masterMetrics, eventLoop, memoryUsage, process),
    require('./plugins/worker-stats').master(workerMetrics),
    require('./plugins/worker-notifier').master(send),
    require('./plugins/message-broadcaster').master(send)
  ].map(plugin => plugin(context));

  return engine.master(fallbackFunction, log)(context);
};

function defaultFallback(err) {
  log.error('Cluster failed with: ', err);
}

function measured({appHost, appName, statsd}) {
  const measured = new WixMeasured(appHost, appName);
  connectStatsD(StatsD, StatsDAdapter, log)(measured, statsd);

  const infraMetrics = measured.collection('tag', 'INFRA');
  const masterMetrics = infraMetrics.collection('class', 'master-process');
  const workerMetrics = infraMetrics.collection('class', 'worker-process');

  return {masterMetrics, workerMetrics};
}
