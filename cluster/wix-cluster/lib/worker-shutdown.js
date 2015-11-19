'use strict';
let cluster = require('cluster'),
  exchange = require('wix-cluster-exchange'),
  shutdownExchange = exchange.client('cluster-shutdown');

module.exports.forceExitTimeout = 5000;
let resourcesToClose = [];

module.exports.addResourceToClose = (resource) => {
  if (!resource.close || typeof resource.close !== 'function') {
    throw new Error('expecting only resources with a close function');
  }
  resourcesToClose.push(resource);
};

module.exports.shutdown = () => {
  try {
    shutdownExchange.send({type: 'worker-shutdown-gracefully', id: cluster.worker.id});
    var killtimer = setTimeout(function() {
      try {
        // we ignore this error
        shutdownExchange.send({type: 'worker-shutdown-forced', id: cluster.worker.id});
      }
      catch (e) {}
      module.exports.exit();
      console.log('Worker with id: %s is exiting', cluster.worker.id, new Date());
    }, module.exports.forceExitTimeout);
    // But don't keep the process open just for that!
    killtimer.unref();

    // closed resources that keep the process alive, like express and server ports
    resourcesToClose.forEach((resource) => {
      resource.close();
    });

    // Let the master know we're dead.  This will trigger a
    // 'disconnect' in the cluster master, and then it will fork
    // a new worker.
    cluster.worker.disconnect();
    console.log('Worker with id: %s has initiated terminating', cluster.worker.id, new Date());
  }
  catch (e) {
    console.error('fatal error in worker-shutdown.', e.stack);
    module.exports.exit();
  }
};

module.exports.exit = () => {
  process.exit(1);
};

