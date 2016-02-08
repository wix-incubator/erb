'use strict';
const cluster = require('cluster'),
  wixCluster = require('../..'),
  testNotifier = require('./parent-notifier-plugin');

wixCluster({
  app: done => done(),
  workerCount: process.env.workerCount,
  plugins: [testNotifier(), new ErroingPlugin()]
}).start(err => {
  if (err) {
    process.send({event: 'start-completed', err: { name: err.name, message: err.message}});
  }
});

function ErroingPlugin() {
  this.onWorker = (cluster, next) => {
    throw new Error('client plugin throws');
  };
}