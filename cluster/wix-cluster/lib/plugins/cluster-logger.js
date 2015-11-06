'use strict';
module.exports = () => new ClusterLogger();

/**
 * Logs cluster lifecycle events.
 *
 * TODO: plug-in proper logger.
 */
function ClusterLogger() {}

ClusterLogger.prototype.onMaster = (cluster, next) => {

  cluster.on('fork', worker => console.log('Worker with id: %s forked.', worker.id));
  cluster.on('online', worker => console.log('Worker with id: %s is online.', worker.id));
  cluster.on('listening', worker => console.log('Worker with id: %s is listening.', worker.id));
  cluster.on('disconnect', worker => console.log('Worker with id: %s disconnected.', worker.id));
  cluster.on('exit', worker => console.log('Worker with id: %s exited.', worker.id));

  next();
};