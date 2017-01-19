const messages = require('../messages'),
  Rx = require('rxjs');

module.exports.master = sendToWorker => context => {
  const {cluster} = context;
  Rx.Observable.fromEvent(cluster, 'message', (worker, msg) => msg)
    .filter(messages.isBroadcast)
    .subscribe(msg => Object.keys(cluster.workers).forEach(workerId => sendToWorker(cluster.workers[workerId], msg)));
};