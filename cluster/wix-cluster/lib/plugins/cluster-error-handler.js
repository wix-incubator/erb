'use strict';
const log = require('wix-logger').get('wix-cluster');

module.exports = () => new ClusterErrorHandler();
/**
 * Gracefully shuts down worker process. Disconnects from cluster, so no new incoming requests are routed to it and
 * then kills process after predefined time.
 *
 * @constructor
 */
function ClusterErrorHandler() {
  const killTimeout = 1000;
  let workerShutdown = require('./../worker-shutdown');

  this.onMaster = (cluster, next) => {
    cluster.on('disconnect', worker => {
      setTimeout(() => {
        if (!worker.isDead()) {
          worker.kill();
          log.info('Worker with id %s killed', worker.id);
        }
      }, killTimeout);
      log.info('Created kill-timer for worker with id %s.', worker.id, new Date().toISOString());
    });

    next();
  };

  this.onWorker = (worker, next) => {
    process.on('uncaughtException',err => {
      log.error(`Worker with id: ${worker.id} encountered "uncaughtException"`, err);
      workerShutdown.shutdown();
    });

    next();
  };

  this.replaceShutdown = (fn) => {
    workerShutdown = fn;
  };
}

