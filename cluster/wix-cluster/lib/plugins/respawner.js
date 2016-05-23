'use strict';
const log = require('wnp-debug')('wix-cluster');

module.exports = () => new ClusterRespawner();

class ClusterRespawner {
  constructor() {
    this.handler = new RespawnHandler();
  }

  onMaster(cluster) {
    cluster.on('disconnect', () => {
      this.handler.around(() => cluster.fork());
    });
  }

  onWorker() {
  }
}

class RespawnHandler {
  constructor() {
    this.stopCount = 10;
    this.stopDuration = 10 * 1000;

    this.deathCount = 0;
    this.deathTime = Date.now();
  }

  around(fork) {
    this.updateCounters();

    if (this.shouldSpawn()) {
      log.info('Spawning new worker. die count: %s, interval: %s', this.deathCount, Date.now() - this.deathTime);
      fork();
    } else {
      log.info('Detected cyclic death not spawning new worker, die count: %s, interval: %s', this.deathCount, Date.now() - this.deathTime);
    }
  }

  updateCounters() {
    if ((Date.now() - this.deathTime) > this.stopDuration) {
      this.deathCount = 1;
      this.deathTime = Date.now();
    } else {
      this.deathCount = this.deathCount + 1;
    }
  }

  shouldSpawn() {
    return ((this.deathCount < this.stopCount) && ((Date.now() - this.deathTime) <= this.stopDuration));
  }
}

