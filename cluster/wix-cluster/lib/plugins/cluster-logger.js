'use strict';
module.exports = function() {
  return new ClusterLogger();
};

/**
 * Logs cluster lifecycle events.
 *
 * TODO: plug-in proper logger.
 */
function ClusterLogger() {}

ClusterLogger.prototype.onMaster = function(cluster, next) {

  cluster.on('fork', function(worker) {
    console.log('Worker with id: %s forked.', worker.id);
  });

  cluster.on('online', function(worker) {
    console.log('Worker with id: %s is online.', worker.id);
  });

  cluster.on('listening', function(worker) {
    console.log('Worker with id: %s is listening.', worker.id);
  });

  cluster.on('disconnect', function(worker) {
    console.log('Worker with id: %s disconnected.', worker.id);
  });

  cluster.on('exit', function(worker) {
    console.log('Worker with id: %s exited.', worker.id);
  });

  next();
};