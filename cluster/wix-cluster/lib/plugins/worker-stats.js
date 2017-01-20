const messages = require('../messages'),
  Rx = require('rxjs');

module.exports.master = workerMetrics => context => {
  const {cluster} = context;
  const workerMessages = Rx.Observable.fromEvent(cluster, 'message', (worker, msg) => msg);

  workerMessages
    .filter(messages.isWorkerMemoryStatsMessage)
    .forEach(msg => {
      workerMetrics.gauge('memory-rss-mb', msg.value.rss);
      workerMetrics.gauge('memory-heap-total-mb', msg.value.heapTotal);
      workerMetrics.gauge('memory-heap-used-mb', msg.value.heapUsed);
    });

  workerMessages
    .filter(messages.isWorkerEventLoopMessage)
    .forEach(msg => workerMetrics.hist('event-loop-ms', msg.value));
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
