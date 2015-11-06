'use strict';
const exchange = require('wix-cluster-exchange'),
  usage = require('usage');

module.exports = () => new ClusterStats();

function ClusterStats() {
  const client = exchange.client('cluster-stats');
  const every30Seconds = 30 * 1000;

  this.onMaster = (cluster, next) => {
    cluster.on('fork', () => client.send({type: 'forked', value: 1}));
    cluster.on('disconnect', () => client.send({type: 'died', value: 1}));
    sendPeriodically('master');

    next();
  };

  this.onWorker = (worker, next) => {
    sendPeriodically(worker.id);

    next();
  };

  function sendPeriodically(source) {
    send(source);
    setInterval(() => send(source), every30Seconds);
  }

  function send(id) {
    usage.lookup(process.pid, (err, result) =>
      client.send({type: 'stats', id: id, pid: process.pid, stats: result}));
  }
}
