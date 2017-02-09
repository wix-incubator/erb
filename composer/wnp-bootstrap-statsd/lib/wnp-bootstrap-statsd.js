const StatsD = require('node-statsd'),
  MeasuredStatsD = require('wix-measured-statsd-adapter'),
  loadConfiguration = require('./load-configuration');

module.exports = ({env, config, log, measuredFactory, shutdownAssembler}) => {
  const configuration = loadConfiguration({env, config, log});
  const adapter = new MeasuredStatsD(new StatsD({host: configuration.host}), {interval: configuration.interval});
  measuredFactory.addReporter(adapter);
  shutdownAssembler.addFunction('statsd', () => adapter.stop());
  
  return configuration;
};
