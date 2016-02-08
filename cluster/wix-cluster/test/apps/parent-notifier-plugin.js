'use strict';
const _ = require('lodash');

module.exports = () => new TestNotifier();

/**
 * Sends events about cluster for test support.
 */
function TestNotifier() {}

TestNotifier.prototype.onMaster = function(cluster, next) {

  cluster.on('message', msg => {
    if (process.send && msg.event) {
        process.send(msg);
    }
  });

  cluster.on('fork', worker => {
    if (process.send) {
      process.send({workerId: worker.id, event: 'fork'});
    }
  });

  cluster.on('listening', function(worker) {
    if (process.send) {
      process.send({workerId: worker.id, event: 'listening'});
    }
  });

  cluster.on('disconnect', function(worker) {
    if (process.send) {
      process.send({workerId: worker.id, event: 'disconnect'});
    }
  });

  cluster.on('exit', function(worker) {
    if (process.send) {
      process.send({workerId: worker.id, event: 'exit'});
    }
  });

  next();
};