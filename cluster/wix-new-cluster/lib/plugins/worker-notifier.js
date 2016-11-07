const messages = require('../messages');

module.exports.master = sendToWorker => context => {
  const {cluster} = context;
  let deathCount = 0;

  cluster.on('listening', worker => {
    sendToWorker(worker, messages.workerCount(workerCount(cluster)));
    sendToWorker(worker, messages.workerDeathCount(deathCount));
  });

  cluster.on('disconnect', () => {
    deathCount += 1;
    forAll(worker => {
      sendToWorker(worker, messages.workerCount(workerCount(cluster) - 1));
      sendToWorker(worker, messages.workerDeathCount(deathCount));
    });
  });

  function workerCount(cluster) {
    return Object.keys(cluster.workers).length;
  }

  function forAll(cb) {
    Object.keys(cluster.workers).forEach(workerId => cb(cluster.workers[workerId]));
  }
};