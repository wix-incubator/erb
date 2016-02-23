'use strict';
module.exports = (exchange, opts) => new ClusterStats(exchange, opts);

class ClusterStats {
  constructor(exchange, opts) {
    const defaultPeriodicitySec = 30;
    const options = opts || {};
    this.interval = options.periodicitySec || defaultPeriodicitySec;
    this.client = exchange.client('cluster-stats');
  }

  onMaster(cluster, next) {
    cluster.on('fork', worker => this.client.send({type: 'forked', id: worker.id}));
    cluster.on('disconnect', worker => this.client.send({type: 'disconnected', id: worker.id}));
    this._sendPeriodically('master');

    next();
  }

  onWorker(worker, next) {
    this._sendPeriodically(worker.id);

    next();
  }

  _sendPeriodically(source) {
    this._send(source);
    setInterval(() => this._send(source), this.interval * 1000);
  }

  _send(id) {
    this.client.send({
      type: 'stats',
      id: id,
      pid: process.pid,
      stats: process.memoryUsage()});
  }
}