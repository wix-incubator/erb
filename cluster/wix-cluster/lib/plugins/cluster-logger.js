'use strict';
const exchange = require('wix-cluster-exchange'),
  shutdownExchange = exchange.server('cluster-shutdown'),
  log = require('wix-logger').get('wix-cluster');

module.exports = () => new ClusterLogger();

/**
 * Logs cluster lifecycle events.
 */
function ClusterLogger() {}

ClusterLogger.prototype.onMaster = (cluster, next) => {

  cluster.on('fork', worker => log.debug('Worker with id: %s forked.', worker.id, new Date().toISOString()));
  cluster.on('online', worker => log.debug('Worker with id: %s is online.', worker.id, new Date().toISOString()));
  cluster.on('listening', worker => log.debug('Worker with id: %s is listening.', worker.id, new Date().toISOString()));
  cluster.on('disconnect', worker => log.debug('Worker with id: %s disconnected.', worker.id, new Date().toISOString()));
  cluster.on('exit', worker => log.debug('Worker with id: %s exited.', worker.id, new Date().toISOString()));
  shutdownExchange.onMessage((message) => {
    if (message.type === 'worker-shutdown-gracefully') {
      log.debug('Worker with id: %s trying to shutdown gracefully after error.', message.id, new Date().toISOString());
    }
    if (message.type === 'worker-shutdown-forced') {
      log.debug('Worker with id: %s is killed after timeout in gracefull shutdown.', message.id, new Date().toISOString());
    }
  });
  next();
};