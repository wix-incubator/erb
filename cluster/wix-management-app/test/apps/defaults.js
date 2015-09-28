'use strict';
var cluster = require('cluster'),
  express = require('express'),
  managementApp = require('../../lib/management-app'),
  join = require('path').join;

var appPort = process.env.PORT || 8080;
var mountPoint = process.env.MOUNT_POINT || '/';

if (cluster.isMaster) {
  managementApp.builder()
    .build()
    .start();

  cluster.on('listening', function () {
    process.send('running');
  });

  cluster.fork();
} else {
  var app = express();
  app.get(join(mountPoint, '/health/is_alive'), function (req, res) {
    res.send('Alive');
  });

  app.listen(appPort);
}