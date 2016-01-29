'use strict';
const EventEmitter = require('events'),
  _ = require('lodash');

module.exports.exchange = () => new ExchangeMock();
module.exports.cluster = () => new ClusterMock();

class ExchangeClientMock {
  constructor(topic) {
    this._messages = [];
    this._topic = topic;
    this._onMessageFn = _.noop;
  }

  onMessage(fn) {
    this._onMessageFn = fn;
  }

  send(obj) {
    this._messages.push(obj);
    this._onMessageFn(obj);
  }

  get messages() {
    return this._messages;
  }

  get topic() {
    return this._topic;
  }
}

class ExchangeMock {
  client(topic) {
    this.client = new ExchangeClientMock(topic);
    return this.client;
  }

  server(topic) {
    this.client = new ExchangeClientMock(topic);
    return this.client;
  }

  get messages() {
    return this.client.messages;
  }

  get topic() {
    return this.client.topic;
  }
}

class ClusterMock extends EventEmitter {
  constructor() {
    super();
    this._forkedCount = 0;
  }

  fork() {
    this._forkedCount += 1;
  }

  get forkedCount() {
    return this._forkedCount;
  }

  emitDisconnect() {
    this.emit('disconnect', {id: 99});
  }

  get id() {
    return 'worker-1';
  }

  emitFork() {
    this.emit('fork', {id: 99});
  }

}
