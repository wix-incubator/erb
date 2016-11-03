'use strict';
const Rx = require('rxjs'),
  messages = require('../messages');

module.exports.master = context => {
  const log = context.log;
  const metrics = context.metrics;
  const StatsD = context.StatsD;
  const StatsDAdapter = context.StatsDAdapter;
  const connect = statsdOpts => {
    const statsd = new StatsD({host: statsdOpts.host});
    const adapter = new StatsDAdapter(statsd, {interval: statsdOpts.interval});
    adapter.addTo(metrics);
  };

  return cluster => {
    Rx.Observable.fromEvent(cluster, 'message', (cluster, msg) => msg)
      .filter(messages.isStatsdActivationMessage)
      .map(msg => msg.value)
      .take(1)
      .subscribe(statsd => {
        if (statsd.host && statsd.interval) {
          connect(statsd);
          log.debug(`statsd activated with host: '${statsd.host}' and interval: '${statsd.interval}'`);
        } else {
          log.error('statsd activation message received, but configuration is incomplete: ', statsd);
        }
      });
  };
};