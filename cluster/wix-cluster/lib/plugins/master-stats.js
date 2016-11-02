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
    this._masterMetrics.gauge('memory-rss-mb', () => this._memoryUsage.rss());
    this._masterMetrics.gauge('memory-heap-total-mb', () => this._memoryUsage.heapTotal());
    this._masterMetrics.gauge('memory-heap-used-mb', () => this._memoryUsage.heapUsed());
  }

  onWorker() {
  }
};