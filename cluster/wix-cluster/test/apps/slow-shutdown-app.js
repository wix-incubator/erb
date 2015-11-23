'use strict';
var express = require('express'),
  workerShutdown = require('../../lib/worker-shutdown'),
  cluster = require('cluster');

module.exports = function () {
  var app = express();

  app.get('/', function(req, res) {
    setTimeout(function() {
      res.write('Hello');
      res.end();
    }, 500);
  });

  app.get('/id', function(req, res) {
    res.write(''+(cluster.worker?cluster.worker.id:'master'));
    res.end();
  });

  app.get('/die', function(req, res) {
    process.nextTick(function() {
      throw 'Error';
    });
    res.end();
  });

  let server = app.listen(3000);
  workerShutdown.addResourceToClose({close: (cb) => {
    setTimeout(cb, 4000);
  }});
  workerShutdown.addResourceToClose(server);

};