'use strict';
var cluster = require('cluster'),
  express = require('express'),
  managementApp = require('../../lib/management-app'),
  join = require('path').join;

var appType = process.env.APP_TYPE;
var appPort = process.env.PORT || 8080;
var mountPoint = process.env.MOUNT_POINT || '/';

if (cluster.isMaster) {
  managementApp.builder()
    .build()
    .start();

  if (appType === 'alive' || appType === 'dead-worker') {
    cluster.on('listening', function () {
      process.send('running');
    });

    cluster.fork();
  } else {
    process.send('running');
  }
} else {
  var app = express();
  app.get(join(mountPoint, '/health/is_alive'), function (req, res) {
    if (appType === 'dead-worker') {
      res.status(400).end();
    } else {
      res.send('Alive');
    }
  });

  app.listen(appPort);
}