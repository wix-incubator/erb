'use strict';
const cluster = require('cluster'),
  EventEmitter = require('events'),
  assert = require('assert');

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

    process.on('message', msg => {
      if (msg.origin && msg.origin === 'wix-cluster' && msg.key) {
        if (msg.key === 'worker-count') {
          this._workerCount = msg.value;
        } else if (msg.key === 'death-count') {
          this._deathCount = msg.value;
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

  configureStatsD(opts) {
    validateStats(opts);
    process.send({
      origin: 'wix-cluster',
      key: 'statsd',
      value: opts
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

  on(event, cb) {
    this._emitter.on(event, cb);
  }

  emit(event, data) {
    this._emitter.emit(event, data);
  }

  configureStatsD(obj) {
    validateStats(obj);
  }
}

function validateStats(obj) {
  assert(obj, 'opts is mandatory');
  assert(obj.interval, 'opts.interval is mandatory');
  assert(obj.host, 'opts.host is mandatory');
}