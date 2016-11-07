module.exports = (StatsD, StatsDAdapter) => (metrics, metricsConf) => {
  const statsd = new StatsD({host: metricsConf.host});
  const adapter = new StatsDAdapter(statsd, {interval: metricsConf.interval});
  adapter.addTo(metrics);
};
