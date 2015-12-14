'use strict';
var app = require('./slow-shutdown-app'),
  wixCluster = require('../..'),
  testNotifier = require('./parent-notifier-plugin');

wixCluster({
  app: app,
  workerCount: process.env.workerCount,
  plugins: [testNotifier()]
}).start();