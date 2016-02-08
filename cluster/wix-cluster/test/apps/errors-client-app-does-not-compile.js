'use strict';
const cluster = require('cluster'),
  wixCluster = require('../..'),
  testNotifier = require('./parent-notifier-plugin');

wixCluster({
  app: done => require('./does-not-exist'),
  workerCount: process.env.workerCount,
  plugins: [testNotifier()]
}).start(err => {
  if (err) {
    process.send({event: 'start-completed', err: { name: err.name, message: err.message}});
  }
});