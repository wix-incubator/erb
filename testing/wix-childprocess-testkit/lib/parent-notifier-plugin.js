'use strict';
module.exports = function(callback) {
  return new TestNotifier(callback);
};

/**
 * Sends events about cluster for test support.
 */
function TestNotifier(callback) {
  this.callback = callback;

  this.onMaster = function(cluster, next) {

    let handleMessage = (event, workerId) => {
      if (process.send) {
        process.send({workerId: workerId, event: event});
      }
      if (callback) {
        callback(event, workerId);
      }
    };

    cluster.on('fork', function(worker) {
      handleMessage('fork', worker.id);
    });

    cluster.on('listening', function(worker) {
      handleMessage('listening', worker.id);
    });

    cluster.on('disconnect', function(worker) {
      handleMessage('disconnect', worker.id);
    });

    cluster.on('exit', function(worker) {
      handleMessage('exit', worker.id);
    });

    next();
  };
}

