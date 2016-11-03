'use strict';
module.exports.master = context => {
  const {log} = context;
  const handler = new RespawnHandler(log);
  return cluster => {
    cluster.on('disconnect', () => handler.around(() => cluster.fork()));
  }
};

class RespawnHandler {
  constructor(log) {
    this._log = log;
    this.stopCount = 10;
    this.stopDuration = 10 * 1000;

    this.deathCount = 0;
    this.deathTime = Date.now();
  }

  around(fork) {
    this.updateCounters();

    if (this.shouldSpawn()) {
      this._log.info('Spawning new worker. die count: %s, interval: %s', this.deathCount, Date.now() - this.deathTime);
      fork();
    } else {
      this._log.info('Detected cyclic death not spawning new worker, die count: %s, interval: %s', this.deathCount, Date.now() - this.deathTime);
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

