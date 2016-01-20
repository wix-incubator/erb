'use strict';
const cluster = require('cluster'),
  express = require('express'),
  managementApp = require('../..');

if (cluster.isMaster) {
  managementApp({
    appPort: process.env.PORT,
    managementPort: process.env.MANAGEMENT_PORT,
    mountPoint: process.env.MOUNT_POINT,
    appInfo: (req, res) => res.send('Hi there from app info')
  }).start();

  cluster.fork();
} else {
  express()
    .get((process.env.MOUNT_POINT || '') + '/health/is_alive', (req, res) => res.send('Alive'))
    .listen(process.env.PORT);
}