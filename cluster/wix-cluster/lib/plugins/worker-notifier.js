module.exports.master = context => {
  const {log} = context;
  const stats = {};
  let deathCount = 0;

  return cluster => {
    cluster.on('fork', worker => {
      worker.on('message', msg => {
        if (msg.origin && msg.origin === 'wix-cluster' && msg.key) {
          if (msg.key === 'client-stats') {
            stats[worker.id] = msg.value;
          } else if (msg.key === 'broadcast') {
            forAll(cluster, worker => send(worker, 'broadcast', msg.value, log));
          }
        }
      });
    });

    cluster.on('listening', worker => {
      sendWorkerCount(worker, workerCount(cluster), log);
      sendWorkerDeathCount(worker, deathCount, log);
    });

    cluster.on('disconnect', worker => {
      delete stats[worker.id];
      deathCount += 1;
      forAll(cluster, worker => {
        sendWorkerCount(worker, workerCount(cluster) - 1, log);
        sendWorkerDeathCount(worker, deathCount, log);
      });
    });
  }
};

function forAll(cluster, cb) {
  Object.keys(cluster.workers).forEach(workerId => {
    const worker = cluster.workers[workerId];
    if (worker && worker.isConnected() && !worker.isDead()) {
      cb(worker)
    }
  });
}

function send(worker, key, value, log) {
  try {
    worker.send({origin: 'wix-cluster', key, value});
  } catch (e) {
    log.error(`failed sending stats with key: ${key} to worker: ${worker.id}`);
  }
}

function workerCount(cluster) {
  return Object.keys(cluster.workers).length;
}

function sendWorkerCount(worker, workerCount, log) {
  send(worker, 'worker-count', workerCount, log);
}

function sendWorkerDeathCount(worker, deathCount, log) {
  send(worker, 'death-count', deathCount, log);
}
