'use strict';
let exchange = require('wix-cluster-exchange'),
  shutdownExchange = exchange.server('cluster-shutdown');

module.exports = () => new ClusterLogger();

/**
 * Logs cluster lifecycle events.
 *
 * TODO: plug-in proper logger.
 */
function ClusterLogger() {}

ClusterLogger.prototype.onMaster = (cluster, next) => {

  cluster.on('fork', worker => console.log('Worker with id: %s forked.', worker.id, new Date()));
  cluster.on('online', worker => console.log('Worker with id: %s is online.', worker.id, new Date()));
  cluster.on('listening', worker => console.log('Worker with id: %s is listening.', worker.id, new Date()));
  cluster.on('disconnect', worker => console.log('Worker with id: %s disconnected.', worker.id, new Date()));
  cluster.on('exit', worker => console.log('Worker with id: %s exited.', worker.id, new Date()));
  shutdownExchange.onMessage((message) => {
    if (message.type === 'worker-shutdown-gracefully') {
      console.log('Worker with id: %s trying to shutdown gracefully after error.', message.id, new Date());
    }
    if (message.type === 'worker-shutdown-forced') {
      console.log('Worker with id: %s is killed after timeout in gracefull shutdown.', message.id, new Date());
    }
  });
  next();
};