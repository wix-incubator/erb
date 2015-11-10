'use strict';
const exchange = require('wix-cluster-exchange'),
  metrics = require('wix-measured').default;

module.exports.plugin = () => new MetricsPlugin();


function MetricsPlugin() {

  const server = exchange.server('wix-metrics');

  this.onMaster = (cluster, next) => {
    server.onMessage(evt => {
      console.log(3, 'master got message');
      if (evt.operationStats) {
        let name = evt.operationStats.operationName;
        metrics.counter(name +'.count').inc();
        metrics.histogram(name+'.duration').update(evt.operationStats.durationMs);
        metrics.histogram(name+'.ttfb').update(evt.operationStats.timeToFirstByteMs);
        if (evt.operationStats.timeout) {
          metrics.counter(name +'.timeout').inc();
        }
        if (evt.operationStats.errors.length > 0) {
          metrics.counter(name +'.errors').inc();
        }

        console.log(metrics.toJSON());
      }
    });
    next();
  };
}
