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
        if (msg.origin && msg.origin === 'wix-cluster' && msg.key) {
          if (msg.key === 'client-stats') {
            this._stats[worker.id] = msg.value;
          } else if (msg.key === 'broadcast') {
            this._forAll(cluster, worker => ClusterClientNotifier._send(worker, 'broadcast', msg.value));
          }
        }
      });
    });

    cluster.on('listening', worker => {
      this._sendWorkerCount(worker, this._workerCount(cluster));
      this._sendWorkerDeathCount(worker);
      this._sendMemoryStats(worker);
    });

    cluster.on('disconnect', worker => {
      delete this._stats[worker.id];
      this._deathCount += 1;
      this._forAll(cluster, worker => {
        this._sendWorkerCount(worker, this._workerCount(cluster) - 1);
        this._sendWorkerDeathCount(worker);
        this._sendMemoryStats(worker);
      });
    });

    setInterval(() => {
      this._forAll(cluster, worker => this._sendMemoryStats(worker));
    }, this._interval).unref();
  }

  onWorker(worker) {
    ClusterClientNotifier._send(worker, 'client-stats', this._process.memoryUsage());
    setInterval(() => ClusterClientNotifier._send(worker, 'client-stats', this._process.memoryUsage()), this._interval).unref();
  }

  _forAll(cluster, cb) {
    Object.keys(cluster.workers).forEach(workerId => {
      const worker = cluster.workers[workerId];
      if (worker && worker.isConnected() && !worker.isDead()) {
        cb(worker)
      }
    });
  }

  static _send(worker, key, value) {
    try {
      worker.send({origin: 'wix-cluster', key, value});
    } catch (e) {
      log.error(`failed sending stats with key: ${key} to worker: ${worker.id}`);
    }
  }

  _workerCount(cluster) {
    return Object.keys(cluster.workers).length;
  }

  _sendWorkerCount(worker, workerCount) {
    ClusterClientNotifier._send(worker, 'worker-count', workerCount);
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
