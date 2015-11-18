'use strict';
const cluster = require('cluster'),
  express = require('express'),
  managementApp = require('../../lib/management-app'),
  StatsManPlugin = require('./cluster-stats'),
  join = require('path').join;

const appPort = process.env.PORT || 8080;
const mountPoint = process.env.MOUNT_POINT || '/';

if (cluster.isMaster) {
  managementApp.builder()
    .addPages([new StatsManPlugin()])
    .build()
    .start();

  cluster.on('listening', () => process.send('running'));

  cluster.fork();
} else {
  const app = express();
  app.get(join(mountPoint, '/health/is_alive'), (req, res) => {
    res.send('Alive');
  });

  app.listen(appPort);
}