'use strict';
module.exports = function() {
  return new TestNotifier();
};

/**
 * Sends events about cluster for test support.
 */
function TestNotifier() {}

TestNotifier.prototype.onMaster = function(cluster, next) {

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

  next();
};