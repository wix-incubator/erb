'use strict';
const EventEmitter = require('events');

module.exports.worker = obj => new WorkerMock(obj);
module.exports.process = memoryUsage => new ProcessMock(memoryUsage);
module.exports.cluster = workerCount => new ClusterMock(workerCount);

class ClusterMock extends EventEmitter {
  constructor(workers) {
    super();
    this._forkedCount = 1;
    this._workers = {};
    (workers || []).forEach(worker => this._workers[worker.id] = worker);
  }

  get workers() {
    return this._workers;
  }

  fork() {
    this._forkedCount += 1;
  }

  get forkedCount() {
    return this._forkedCount;
  }
}

class WorkerMock extends EventEmitter {
  constructor(obj) {
    super();
    const options = obj || {};
    this._id = options.id || 1;
    this._isDead = options.isDead || false;
    this._sent = [];
    this._killCount = 0;
    this._disconnectCount = 0;
  }

  get process() {
    return {
      send: msg => this.emit('message', msg)
    };
  }

  setIsDead(value) {
    this._isDead = value;
  }

  get id() {
    return this._id;
  }

  isDead() {
    return this._isDead;
  }

  kill() {
    this._killCount += 1;
  }

  isConnected() {
    return true;
  }

  disconnect() {
    this._disconnectCount += 1;
  }

  get killAttemptCount() {
    return this._killCount;
  }

  get disconnectAttemptCount() {
    return this._disconnectCount;
  }

  send(obj) {
    this._sent.push(obj);
  }

  receivedMessages() {
    return this._sent;
  }
}

class ProcessMock extends EventEmitter {
  constructor(memoryUsage) {
    super();
    this._memoryUsage = memoryUsage || { rss: 1, heapTotal: 2, heapUsed: 3 }
  }

  setMemoryUsage(obj) {
    this._memoryUsage = obj;
  }

  memoryUsage() {
    return this._memoryUsage;
  }
}