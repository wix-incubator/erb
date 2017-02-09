module.exports = (StatsD, StatsDAdapter, log) => (metrics, statsdConf) => {
  if (statsdConf) {
    const statsd = new StatsD({host: statsdConf.host});
    const adapter = new StatsDAdapter(statsd, {interval: statsdConf.interval});
    metrics.addReporter(adapter);
    log.debug(`Configured master statsd with host: ${statsdConf.host} and interval: ${statsdConf.interval}`);
  } else {
    log.debug('statsd configuration not provided, not configuring master statsd reporting');
  }
};
