const messages = require('../messages'),
  Rx = require('rxjs');

module.exports = class StatsReporter {
  constructor(workerMetrics, eventLoop, memoryUsage, process) {
    this._workerMetrics = workerMetrics;
    this._eventLoop = eventLoop;
    this._memoryUsage = memoryUsage;
    this._process = process;
  }

  onMaster(cluster) {
    const workerMessages = Rx.Observable.fromEvent(cluster, 'message', (cluster, msg) => msg);

    workerMessages
      .filter(messages.isWorkerMemoryStatsMessage)
      .forEach(msg => {
        this._workerMetrics.gauge('memory-rss-mb', () => msg.value.rss);
        this._workerMetrics.gauge('memory-heap-total-mb', () => msg.value.heapTotal);
        this._workerMetrics.gauge('memory-heap-used-mb', () => msg.value.heapUsed);
      });

    workerMessages
      .filter(messages.isWorkerEventLoopMessage)
      .forEach(msg => this._workerMetrics.hist('event-loop-ms', msg.value));
  }

  onWorker() {
    this._sendMemoryStats();
    const eventLoopInterval = this._eventLoop(ns => this._sendEventLoopStats(ns));
    const memoryInterval = setInterval(() => this._sendMemoryStats(), 4000);

    process.on('uncaughtException', () => {
      clearInterval(memoryInterval);
      eventLoopInterval();
    });
  }

  _sendEventLoopStats(ns) {
    this._process.send(messages.workerEventLoopMessage(ns))
  }

  _sendMemoryStats() {
    this._process.send(messages.workerMemoryStatsMessage({
      heapTotal: this._memoryUsage.heapTotal(),
      heapUsed: this._memoryUsage.heapUsed(),
      rss: this._memoryUsage.rss()
    }));
  }
};