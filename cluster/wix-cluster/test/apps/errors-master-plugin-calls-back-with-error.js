'use strict';
const cluster = require('cluster'),
  wixCluster = require('../..'),
  testNotifier = require('./parent-notifier-plugin'),
  app = require('./index');

wixCluster({
  app: () => app,
  workerCount: process.env.workerCount,
  plugins: [testNotifier(), new ErroingPlugin()]
}).start(err => {
  if (err) {
    process.send({event: 'start-completed', err: { name: err.name, message: err.message}});
  }
});

function ErroingPlugin() {
  this.onMaster = (cluster, next) => next(Error('master plugin failed'));
}