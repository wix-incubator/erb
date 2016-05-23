'use strict';
const log = require('wnp-debug')('wix-cluster');

module.exports = (currentProcess, statsRefreshInterval) =>
  new ClusterClientNotifier(currentProcess, statsRefreshInterval);

class ClusterClientNotifier {
  constructor(currentProcess, statsRefreshInterval) {
    this._process = currentProcess;
    this._interval = statsRefreshInterval || 10000;
    this._stats = {};
    this._deathCount = 0;
  }

  onMaster(cluster) {
    cluster.on('fork', worker => {
      worker.on('message', msg => {
        if (msg.origin && msg.origin === 'wix-cluster' && msg.key && msg.key === 'client-stats') {
          this._stats[worker.id] = msg.value;
        }
      });
    });

    cluster.on('listening', worker => {
      this._sendWorkerCount(cluster, worker);
      this._sendWorkerDeathCount(worker);
      this._sendMemoryStats(worker);
    });

    cluster.on('disconnect', worker => {
      delete this._stats[worker.id];
      this._deathCount += 1;
      Object.keys(cluster.workers).forEach(workerId => {
        const worker = cluster.workers[workerId];
        if (worker && worker.isConnected() && !worker.isDead()) {
          this._sendWorkerCount(cluster, worker);
          this._sendWorkerDeathCount(worker);
          this._sendMemoryStats(worker);
        }
      });
    });

    setInterval(() => {
      Object.keys(cluster.workers).forEach(workerId => {
        const worker = cluster.workers[workerId];
        if (worker && worker.isConnected() && !worker.isDead()) {
          this._sendMemoryStats(worker);
        }
      });
    }, this._interval).unref();
  }

  onWorker(worker) {
    ClusterClientNotifier._send(worker, 'client-stats', this._process.memoryUsage());
    setInterval(() => ClusterClientNotifier._send(worker, 'client-stats', this._process.memoryUsage()), this._interval).unref();
  }

  static _send(worker, key, value) {
    try {
      worker.send({origin: 'wix-cluster', key, value});
    } catch (e) {
      log.error(`failed sending stats with key: ${key} to worker: ${worker.id}`);
    }
  }

  _sendWorkerCount(cluster, worker) {
    ClusterClientNotifier._send(worker, 'worker-count', Object.keys(cluster.workers).length);
  }

  _sendWorkerDeathCount(worker) {
    ClusterClientNotifier._send(worker, 'death-count', this._deathCount);
  }

  _sendMemoryStats(worker) {
    ClusterClientNotifier._send(worker, 'stats', this._memStats());
  }

  _memStats() {
    const res = {rss: 0, heapTotal: 0, heapUsed: 0};
    Object.keys(this._stats).forEach(id => {
      const el = this._stats[id];
      res.rss += el.rss;
      res.heapTotal += el.heapTotal;
      res.heapUsed += el.heapUsed;
    });

    return res;
  }


}
