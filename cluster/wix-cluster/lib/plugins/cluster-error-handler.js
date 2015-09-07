'use strict';
module.exports = function () {
  return new ClusterErrorHandler();
};

/**
 * Gracefully shuts down worker process. Disconnects from cluster, so no new incoming requests are routed to it and
 * then kills process after predefined time.
 *
 * @constructor
 */
function ClusterErrorHandler() {
  var killTimeout = 1000;

  this.onMaster = function (cluster, next) {
    cluster.on('disconnect', function (worker) {
      setTimeout(function () {
        if (!worker.isDead()) {
          worker.kill();
          console.log('Worker with id %s killed', worker.id);
        }
      }, killTimeout);
      console.log('Created kill-timer for worker with id %s.', worker.id);
    });

    next();
  };

  this.onWorker = function (worker, next) {
    process.on('uncaughtException', function (err) {
      console.log('Child process with id: %s encountered "uncaughtException": %s', worker.id, err);
      worker.disconnect();
    });

    next();
  };
}

