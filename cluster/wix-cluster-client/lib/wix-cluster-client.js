'use strict';
const cluster = require('cluster'),
  EventEmitter = require('events');


module.exports = () => {
  if (cluster.isWorker) {
    return new WixClusterClient();
  } else {
    return new NonClusteredClient();
  }
};

class WixClusterClient {
  constructor() {
    this._emitter = new EventEmitter();
    this._workerId = cluster.worker.id;
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
        } else if (msg.key === 'broadcast') {
          this._emitter.emit(msg.value.key, msg.value.value);
        }
      }
    });
  }

  get workerId() {
    return this._workerId;
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

  on(event, cb) {
    this._emitter.on(event, cb);
  }

  emit(event, data) {
    process.send({
      origin: 'wix-cluster',
      key: 'broadcast',
      value: {
        key: event,
        value: data
      }
    });
  }
}

class NonClusteredClient {
  constructor() {
    this._emitter = new EventEmitter();
    this._workerId = 1;
    this._workerCount = 1;
    this._deathCount = 'N/A';
  }

  get workerId() {
    return this._workerId;
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

  on(event, cb) {
    this._emitter.on(event, cb);
  }

  emit(event, data) {
    this._emitter.emit(event, data);
  }

}