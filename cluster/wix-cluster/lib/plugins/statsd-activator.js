'use strict';
const Rx = require('rxjs'),
  messages = require('../messages');

module.exports.master = (log, metrics, connect) => context => {
  const {cluster} = context;
  Rx.Observable.fromEvent(cluster, 'message', (cluster, msg) => msg)
    .filter(messages.isStatsdActivationMessage)
    .map(msg => msg.value)
    .take(1)
    .subscribe(statsd => {
      if (statsd.host && statsd.interval) {
        connect(metrics, statsd);
        log.debug(`statsd activated with host: '${statsd.host}' and interval: '${statsd.interval}'`);
      } else {
        log.error('statsd activation message received, but configuration is incomplete: ', statsd);
      }
    });
};