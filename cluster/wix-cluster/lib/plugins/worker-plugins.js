const log = require('wnp-debug')('wix-cluster'),
  eventLoop = require('../meter/event-loop').loop,
  memoryUsage = require('../meter/memory-usage').usage;

module.exports = opts => {
  const {statsRefreshInterval, shutdownAppProvider} = opts;
  const currentProcess = process;

  const context = {
    log,
    currentProcess,
    shutdownAppProvider,
    eventLoop,
    memoryUsage,
    statsRefreshInterval};

  return [
    require('./error-handler'),
    require('./worker-stats'),
  ].map(plugin => plugin.worker(context));
};
