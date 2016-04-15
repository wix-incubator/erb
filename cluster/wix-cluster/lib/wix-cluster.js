'use strict';
const cluster = require('cluster'),
  log = require('wix-logger').get('wix-cluster');

module.exports.run = (appFunction, opts) => {
  const workerCount = opts && opts.workerCount || 2;
  const statsRefreshInterval = opts && opts.statsRefreshInterval || 10000;

  const plugins = [
    require('./plugins/logger')(),
    require('./plugins/respawner')(),
    require('./plugins/error-handler')(process),
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
      return appFunction();
    }).catch(e => {
      log.error('Failed to start worker:', e);
      return Promise.reject(e);
    });
  }
};