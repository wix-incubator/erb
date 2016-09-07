'use strict';
const log = require('wnp-debug')('wix-cluster');

module.exports = (currentProcess, shutdownApp) => new ClusterErrorHandler(currentProcess, shutdownApp);

class ClusterErrorHandler {
  constructor(currentProcess, shutdownApp) {
    this.killTimeout = 5000;
    this._process = currentProcess;
    this._shutdownApp = shutdownApp;
  }

  onMaster(cluster) {
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
  }

  onWorker(worker) {
    this._process.on('uncaughtException', err => {
      log.error(`Worker with id: ${worker.id} encountered "uncaughtException"`, err);
      try {
        if (worker.isConnected() && !worker.isDead()) {
          worker.disconnect();
        }
        this._shutdownApp();

      } catch (e) {
        log.error('Failed disconnecting worker: ', e);
      }
    });
  }
}

