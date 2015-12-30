'use strict';
const exchange = require('wix-cluster-exchange'),
  metrics = require('wix-measured').default;

module.exports.plugin = () => new MetricsPlugin();

function MetricsPlugin() {

  const server = exchange.server('wix-metrics');

  this.onMaster = (cluster, next) => {
    /**
     * expecting metrics of type
     * {
        operationName: [String],
        startTime: [ISO Date formatted string],
        timeToFirstByteMs: [Number],
        durationMs: [Number],
        timeout: [Boolean],
        errors: [Array<String>]
      }
     */
    server.onMessage(evt => {
      if (evt.operationStats) {
        try {
          let name = evt.operationStats.operationName;
          metrics.meter('requests.'+name +'.counter').mark();
          metrics.histogram('requests.'+name+'.duration').update(evt.operationStats.durationMs);
          metrics.histogram('requests.'+name+'.ttfb').update(evt.operationStats.timeToFirstByteMs);
          evt.operationStats.errors.forEach(err => metrics.counter('requests.'+name +'.error.' + err.name).inc());
        }
        catch (e) {
          //TODO: logger
          console.log(e);
        }
      }
    });

    next();
  };
}
