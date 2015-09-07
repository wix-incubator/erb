'use strict';
var exchange = require('wix-cluster-exchange'),
  usage = require('usage');

module.exports = function () {
  return new ClusterStats();
};

function ClusterStats() {
  var client = exchange.client('cluster-stats');
  var every30Seconds = 30 * 1000;

  this.onMaster = function (cluster, next) {

    cluster.on('fork', function () {
      client.send({type: 'forked', value: 1});
    });

    cluster.on('disconnect', function () {
      client.send({type: 'died', value: 1});
    });

    sendPeriodically('master');

    next();
  };

  this.onWorker = function (worker, next) {
    sendPeriodically(worker.id);

    next();
  };

  function sendPeriodically(source) {
    send(source);
    setInterval(function () {
      send(source);
    }, every30Seconds);
  }

  function send(id) {
    usage.lookup(process.pid, function (err, result) {
      client.send({type: 'stats', id: id, pid: process.pid, stats: result});
    });
  }
}
