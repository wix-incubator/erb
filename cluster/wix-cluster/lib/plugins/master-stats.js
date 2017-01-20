module.exports.master = (masterMetrics, eventLoop, memoryUsage, currentProcess) => context => {
  const {cluster} = context;
  
  masterMetrics.gauge('worker-count', () => Object.keys(cluster.workers).length);
  masterMetrics.gauge('uptime-minutes', () => Math.round(currentProcess.uptime()/60));
  cluster.on('fork', () => masterMetrics.meter('fork'));
  cluster.on('exit', () => masterMetrics.meter('exit'));

  eventLoop(ms => masterMetrics.hist('event-loop-ms', ms));
  memoryUsage(stats => {
    masterMetrics.gauge('memory-rss-mb', stats.rss);
    masterMetrics.gauge('memory-heap-total-mb', stats.heapTotal);
    masterMetrics.gauge('memory-heap-used-mb', stats.heapUsed);
  });
};
