'use strict';
module.exports = opts => new ClusterClientNotifier(opts);

class ClusterClientNotifier {
  constructor(opts) {
    this._stats = {};
    this._deathCount = 0;
    this._interval = opts.statsRefreshInterval || 10000;
  }

  onMaster(cluster, next) {
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
        if (worker.id.toString() !== workerId) {
          this._sendWorkerDeathCount(cluster.workers[workerId]);
        }
      });
    });

    setInterval(() => {
      Object.keys(cluster.workers).forEach(workerId => {
        this._sendMemoryStats(cluster.workers[workerId]);
      });
    }, this._interval).unref();

    next();
  }

  onWorker(worker, next) {
    this._send(worker, 'client-stats', process.memoryUsage());
    setInterval(() => this._send(worker, 'client-stats', process.memoryUsage()), this._interval).unref();

    next();
  }

  _broadcast(cluster) {
    Object.keys(cluster.workers).forEach(workerId => {
      const worker = cluster.workers[workerId];
      this._sendWorkerCount(cluster, worker);
      this._sendWorkerDeathCount(worker)
    });
  }

  _send(worker, key, value) {
    try {
      worker.send({origin: 'wix-cluster', key, value});
    } catch (e) {
    }
  }

  _sendWorkerCount(cluster, worker) {
    this._send(worker, 'worker-count', Object.keys(cluster.workers).length);
  }

  _sendWorkerDeathCount(worker) {
    this._send(worker, 'death-count', this._deathCount);
  }

  _sendMemoryStats(worker) {
    this._send(worker, 'stats', this._memStats());
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
