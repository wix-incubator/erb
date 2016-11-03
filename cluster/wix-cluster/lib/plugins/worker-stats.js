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
        this._workerMetrics.gauge('memory-rss-mb', msg.value.rss);
        this._workerMetrics.gauge('memory-heap-total-mb', msg.value.heapTotal);
        this._workerMetrics.gauge('memory-heap-used-mb', msg.value.heapUsed);
      });

    workerMessages
      .filter(messages.isWorkerEventLoopMessage)
      .forEach(msg => this._workerMetrics.hist('event-loop-ms', msg.value));
  }

  onWorker() {
    const stopEventLoopTimer = this._eventLoop(ns => this._process.send(messages.workerEventLoopMessage(ns)));
    const stopMemoryStatsTimer = this._memoryUsage(stats => this._process.send(messages.workerMemoryStatsMessage(stats)));

    Rx.Observable.fromEvent(this._process, 'uncaughtException')
      .take(1)
      .subscribe(() => {
        stopMemoryStatsTimer();
        stopEventLoopTimer();
      });
  }
};