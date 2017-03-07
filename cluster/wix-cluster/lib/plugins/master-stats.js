module.exports.master = (masterMetrics, eventLoop, memoryUsage, currentProcess) => context => {
  const {cluster} = context;
  const {workerCount, uptimeMinutes, eventLoopMs, forkMeter, exitMeter, memoryRss, memoryHeapTotal, memoryHeapUsed} = collectors(masterMetrics);

  workerCount(() => Object.keys(cluster.workers).length);
  uptimeMinutes(() => Math.round(currentProcess.uptime() / 60));
  cluster.on('fork', () => forkMeter());
  cluster.on('exit', () => exitMeter());

  eventLoop(ms => eventLoopMs(ms));
  memoryUsage(stats => {
    memoryRss(stats.rss);
    memoryHeapTotal(stats.heapTotal);
    memoryHeapUsed(stats.heapUsed);
  });
};

function collectors(metrics) {
  return {
    workerCount: metrics.gauge('worker-count'),
    uptimeMinutes: metrics.gauge('uptime-minutes'),
    eventLoopMs: metrics.hist('process', 'event-loop-ms'),
    forkMeter: metrics.meter('process', 'fork'),
    exitMeter: metrics.meter('process', 'exit'),
    memoryRss: metrics.gauge('memory-rss-mb'),
    memoryHeapTotal: metrics.gauge('memory-heap-total-mb'),
    memoryHeapUsed: metrics.gauge('memory-heap-used-mb')
  }
}
