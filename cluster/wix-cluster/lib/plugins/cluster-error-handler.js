'use strict';
const log = require('wix-logger').get('wix-cluster');

module.exports = () => new ClusterErrorHandler();

class ClusterErrorHandler {
  constructor() {
    this.killTimeout = 1000;
    this.workerShutdown = require('./../worker-shutdown');
  }

  onMaster(cluster, next) {
    cluster.on('disconnect', worker => {
      setTimeout(() => {
        if (!worker.isDead()) {
          worker.kill();
          log.info('Worker with id %s killed', worker.id);
        } else {
          log.info('Worker with id %s died, not killing anymore', worker.id);
        }
      }, this.killTimeout);
      log.info('Created kill-timer for worker with id %s.', worker.id, new Date().toISOString());
    });

    next();
  }

  onWorker(worker, next) {
    process.on('uncaughtException', err => {
      log.error(`Worker with id: ${worker.id} encountered "uncaughtException"`, err);
      //TODO: figure out why it is holding process and not letting it die - see 'shuts-down dying worker process gracefully'
      this.workerShutdown.shutdown();
    });

    next();
  }

  replaceShutdown(fn) {
    this.workerShutdown = fn;
  }
}

