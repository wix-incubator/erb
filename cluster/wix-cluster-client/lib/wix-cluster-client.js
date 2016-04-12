'use strict';
const cluster = require('cluster');

module.exports = () => {
  if (cluster.isWorker) {
    return new WixClusterClient();
  } else {
    return new NonClusteredClient();
  }
};

class WixClusterClient {
  constructor() {
    this._workerCount = 0;
    this._deathCount = 0;
    this._stats = {
      rss: 0,
      heapTotal: 0,
      heapUsed: 0
    };
    process.on('message', msg => {
      if (msg.origin && msg.origin === 'wix-cluster' && msg.key) {
        if (msg.key === 'worker-count') {
          this._workerCount = msg.value;
        } else if (msg.key === 'death-count') {
          this._deathCount = msg.value;
        } else if (msg.key === 'stats') {
          this._stats = msg.value;
        }
      }
    });
  }

  get workerCount() {
    return this._workerCount;
  }

  get deathCount() {
    return this._deathCount;
  }

  get stats() {
    return this._stats;
  }
}

class NonClusteredClient {
  constructor() {
    this._workerCount = 1;
    this._deathCount = 'N/A';
  }

  get workerCount() {
    return this._workerCount;
  }

  get deathCount() {
    return this._deathCount;
  }

  get stats() {
    return process.memoryUsage();
  }
}