'use strict';
const cluster = require('cluster'),
  express = require('express'),
  managementApp = require('../../lib/management-app');

if (cluster.isMaster) {
  managementApp.builder().build().start();
  cluster.fork();
} else {
  express()
    .get(process.env.MOUNT_POINT + '/health/is_alive', (req, res) => res.status(500).end())
    .listen(process.env.PORT);
}