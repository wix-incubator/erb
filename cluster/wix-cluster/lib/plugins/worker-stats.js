const messages = require('../messages'),
  Rx = require('rxjs');

module.exports.master = workerMetrics => context => {
  const {cluster} = context;
  const workerMessages = Rx.Observable.fromEvent(cluster, 'message', (worker, msg) => msg);
  const {eventLoopMs, memoryRss, memoryHeapTotal, memoryHeapUsed} = collectors(workerMetrics);

  workerMessages
    .filter(messages.isWorkerMemoryStatsMessage)
    .forEach(msg => {
      memoryRss(msg.value.rss);
      memoryHeapTotal(msg.value.heapTotal);
      memoryHeapUsed(msg.value.heapUsed);
    });

  workerMessages
    .filter(messages.isWorkerEventLoopMessage)
    .forEach(msg => eventLoopMs(msg.value));
};

module.exports.worker = (eventLoop, memoryUsage) => {
  return context => {
    const {currentProcess} = context;
    const stopEventLoopTimer = eventLoop(ns => currentProcess.send(messages.workerEventLoopMessage(ns)));
    const stopMemoryStatsTimer = memoryUsage(stats => currentProcess.send(messages.workerMemoryStatsMessage(stats)));

    Rx.Observable.fromEvent(currentProcess, 'uncaughtException')
      .take(1)
      .subscribe(() => {
        stopMemoryStatsTimer();
        stopEventLoopTimer();
      });
  }
};

function collectors(metrics) {
  return {
    eventLoopMs: metrics.hist('process', 'event-loop-ms'),
    memoryRss: metrics.gauge('memory', 'rss-mb'),
    memoryHeapTotal: metrics.gauge('memory', 'heap-total-mb'),
    memoryHeapUsed: metrics.gauge('memory', 'heap-used-mb')
  }
}
