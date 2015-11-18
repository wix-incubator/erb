'use strict';
var app = require('./app'),
  wixClusterBuilder = require('wix-cluster').builder,
  cluster = require('cluster');

wixClusterBuilder(app)
  .withWorkerCount(1)
  .start();

cluster.on('fork', function(worker) {
  process.send({workerId: worker.id, event: 'fork'});
});

cluster.on('listening', function(worker) {
  process.send({workerId: worker.id, event: 'listening'});
});

cluster.on('disconnect', function(worker) {
  process.send({workerId: worker.id, event: 'disconnect'});
});

cluster.on('exit', function(worker) {
  process.send({workerId: worker.id, event: 'exit'});
});
