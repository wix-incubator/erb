'use strict';
var app = require('./index'),
  wixCluster = require('../..'),
  testNotifier = require('./parent-notifier-plugin'),
  express = require('express');

const managementApp = {
  start: () => express().get('/', (req, res) => res.end()).listen(8084)
};

wixCluster({
  app: app,
  managementApp: managementApp,
  workerCount: process.env.workerCount,
  plugins: [testNotifier()]
}).start();