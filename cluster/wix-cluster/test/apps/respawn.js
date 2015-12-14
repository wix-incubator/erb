'use strict';
var app = require('./index'),
  wixCluster = require('../..'),
  respawner = require('../../lib/plugins/cluster-respawner'),
  testNotifier = require('./parent-notifier-plugin');

wixCluster({
  app: app,
  workerCount: process.env.workerCount,
  withoutDefaultPlugins: true,
  plugins: [respawner(), testNotifier()]
}).start();