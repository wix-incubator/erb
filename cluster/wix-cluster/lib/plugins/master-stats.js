module.exports.master = context => {
  const masterMetrics = context.masterMetrics;
  const eventLoop = context.eventLoop;
  const memoryUsage = context.memoryUsage;

  return cluster => {
    cluster.on('fork', () => masterMetrics.meter('fork'));
    cluster.on('exit', () => masterMetrics.meter('exit'));

    eventLoop(ms => masterMetrics.hist('event-loop-ms', ms));
    memoryUsage(stats => {
      masterMetrics.gauge('memory-rss-mb', stats.rss);
      masterMetrics.gauge('memory-heap-total-mb', stats.heapTotal);
      masterMetrics.gauge('memory-heap-used-mb', stats.heapUsed);
    });
  };
};