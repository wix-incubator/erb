'use strict';
var express = require('express'),
  join = require('path').join,
  Stats = require('./plugins/cluster-stats'),
  request = require('request');

module.exports.builder = function () {
  return new ManagementAppBuilder();
};

function ManagementApp(mountPoint, port, routers) {
  var appPort = process.env.PORT || 8080;
  var app = express();

  routers.forEach(function (router) {
    app.use(mountPoint, router);
  });

  app.get(mountPoint, function (req, res) {
    res.send({
      appName: process.env.APP_NAME || 'env key APP_NAME not defined',
      mountPoint: process.env.MOUNT_POINT || 'env key MOUNT_POINT not defined',
      port: process.env.PORT || 'env key PORT not defined',
      managementPort: process.env.MANAGEMENT_PORT || 'env key MANAGEMENT_PORT not defined',
      uptimeSec: process.uptime(),
      timeSec: new Date().getTime(),
      version: process.version,
      pid: process.pid
    });
  });

  app.get(join(mountPoint, '/health/deployment/test'), function (req, res) {
    request('http://localhost:' + appPort + join(mountPoint, '/health/is_alive'), function(error) {
      if (error) {
        res.status(500).end();
      }
      else {
        res.end();
      }
    });
  });

  this.start = function (done) {
    return app.listen(port, function () {
      console.log('Management app listening on path: %s port: %s', mountPoint, port);
      if (done) {
        done();
      }
    });
  };
}

function ManagementAppBuilder() {
  var mountPoint = process.env.MOUNT_POINT || '/';
  var port = process.env.MANAGEMENT_PORT || '8084';
  var pages = [new Stats()];

  this.addPage = function (page) {
    pages.push(page);
    return this;
  };

  this.build = function () {
    return new ManagementApp(mountPoint, port, pages);
  };
}