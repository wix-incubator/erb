'use strict';
const Rx = require('rxjs'),
  messages = require('../messages');

module.exports = class StatsDActivator {
  constructor(metrics, StatsDAdapter, StatsD, log) {
    this._log = log;
    this._connect = statsdOpts => {
      const statsd = new StatsD({host: statsdOpts.host});
      const adapter = new StatsDAdapter(statsd, {interval: statsdOpts.interval});
      adapter.addTo(metrics);
    }
  }

  onMaster(cluster) {
    Rx.Observable.fromEvent(cluster, 'message', (cluster, msg) => msg)
      .filter(messages.isStatsdActivationMessage)
      .map(msg => msg.value)
      .take(1)
      .subscribe(statsd => {
        if (statsd.host && statsd.interval) {
          this._connect(statsd);
          this._log.debug(`statsd activated with host: '${statsd.host}' and interval: '${statsd.interval}'`);
        } else {
          this._log.error('statsd activation message received, but configuration is incomplete: ', statsd);
        }
      });
    return this;
  }

  onWorker() {
  }
};