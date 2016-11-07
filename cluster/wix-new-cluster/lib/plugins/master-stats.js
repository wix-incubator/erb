module.exports.master = (masterMetrics, eventLoop, memoryUsage) => context => {
  const {cluster} = context;
  masterMetrics.gauge('worker-count', () => Object.keys(cluster.workers).length);
  cluster.on('fork', () => masterMetrics.meter('fork'));
  cluster.on('exit', () => masterMetrics.meter('exit'));

  eventLoop(ms => masterMetrics.hist('event-loop-ms', ms));
  memoryUsage(stats => {
    masterMetrics.gauge('memory-rss-mb', stats.rss);
    masterMetrics.gauge('memory-heap-total-mb', stats.heapTotal);
    masterMetrics.gauge('memory-heap-used-mb', stats.heapUsed);
  });
};
