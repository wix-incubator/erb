'use strict';
const cluster = require('cluster'),
  runApp = require('./app-runner'),
  log = require('wnp-debug')('wix-cluster');

module.exports.run = (appFunction, opts) => {
  const statsRefreshInterval = opts && opts.statsRefreshInterval || 10000;
  const metrics = opts && opts.metrics || {};
  let shutdownApp = () => {
  };
  const shutdownAppProvider = () => shutdownApp();

  if (cluster.isMaster) {
    const plugins = require('./plugins/master-plugins')({statsRefreshInterval, metrics});

    return Promise.resolve().then(() => {
      plugins.forEach(plugin => plugin(cluster));
      cluster.fork();
    });
  } else {
    const plugins = require('./plugins/worker-plugins')({shutdownAppProvider, statsRefreshInterval});

    return Promise.resolve().then(() => {
      plugins.forEach(plugin => plugin(cluster.worker));
      return runApp(appFunction, stop => shutdownApp = stop);
    }).catch(e => {
      log.error('Failed to start worker:', e);
      return Promise.reject(e);
    });
  }
};
