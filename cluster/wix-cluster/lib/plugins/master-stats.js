module.exports = class StatsReporter {
  constructor(masterMetrics, eventLoop, memoryUsage) {
    this._masterMetrics = masterMetrics;
    this._eventLoop = eventLoop;
    this._memoryUsage = memoryUsage;
  }

  onMaster(cluster) {
    cluster.on('fork', () => this._masterMetrics.meter('fork'));
    cluster.on('exit', () => this._masterMetrics.meter('exit'));

    this._eventLoop(ms => this._masterMetrics.hist('event-loop-ms', ms));
    this._memoryUsage(stats => {
      this._masterMetrics.gauge('memory-rss-mb', stats.rss);
      this._masterMetrics.gauge('memory-heap-total-mb', stats.heapTotal);
      this._masterMetrics.gauge('memory-heap-used-mb', stats.heapUsed);
    });
  }

  onWorker() {
  }
};