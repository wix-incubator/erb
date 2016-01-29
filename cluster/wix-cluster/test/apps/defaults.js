'use strict';
var app = require('./index'),
  wixCluster = require('../..'),
  testNotifier = require('./parent-notifier-plugin'),
  express = require('express'),
  exchange = require('wix-cluster-exchange');

const stats = [];
exchange.server('cluster-stats').onMessage(msg => stats.push(msg));

const managementApp = {
  start: () => {
    const app = express();
    app.get('/', (req, res) => res.end());
    app.get('/stats', (req, res) => res.json(stats));

    app.listen(8084);
  }
};

wixCluster({
  app: app,
  managementApp: managementApp,
  workerCount: process.env.workerCount,
  plugins: [testNotifier()]
}).start();