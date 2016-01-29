'use strict';
const log = require('wix-logger').get('wix-cluster');

module.exports = (exchange, opts) => new ClusterRespawner(exchange, opts);

class ClusterRespawner {
  constructor (exchange, opts) {
    this.handler = new RespawnHandler(opts);
    this.exchange = exchange;
  }

  onMaster(cluster, next) {
    const shutdownExchange = this.exchange.server('cluster-shutdown');
    shutdownExchange.onMessage(message => {
      if (message.type === 'worker-shutdown-gracefully') {
        let worker = cluster.workers[message.id];
        if (worker && !worker.respawned) {
          worker.respawned = true;
          this.handler.around(() => cluster.fork());
        }
      }
    });

    cluster.on('disconnect', worker => {
      if (worker && !worker.respawned) {
        worker.respawned = true;
        this.handler.around(() => cluster.fork());
      }
    });
    next();
  }
}

class RespawnHandler {
  constructor(opts) {
    const options =  opts || {count: 10, inSeconds: 10};
    this.stopCount = options.count;
    this.stopDuration = options.inSeconds * 1000;

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
    return ((this.deathCount <= this.stopCount) && ((Date.now() - this.deathTime) <= this.stopDuration));
  }
}

