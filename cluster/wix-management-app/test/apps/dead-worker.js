'use strict';
const cluster = require('cluster'),
  express = require('express'),
  managementApp = require('../..');

if (cluster.isMaster) {
  managementApp({
    appPort: process.env.PORT,
    managementPort: process.env.MANAGEMENT_PORT,
    mountPoint: process.env.MOUNT_POINT
  }).start();

  cluster.fork();
} else {
  express()
    .get(process.env.MOUNT_POINT + '/health/is_alive', (req, res) => {
      if (req.accepts('text/html')) {
        res.status(500).send('Internal server error');
      } else {
        res.status(500).json({name: 'Error', message: 'woops'});
      }
    }).listen(process.env.PORT, () => console.error('App listening'));
}