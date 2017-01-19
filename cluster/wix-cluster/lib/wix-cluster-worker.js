'use strict';
const cluster = require('cluster'),
  engine = require('./engine'),
  appLauncher = require('./engine/app-launcher'),
  appStopper = require('./engine/app-stopper'),
  log = require('wnp-debug')('wix-cluster'),
  eventLoop = require('./meter/event-loop').loop,
  memoryUsage = require('./meter/memory-usage').usage;

module.exports = appFunction => {
  const currentProcess = process;
  const currentWorker = cluster.worker;
  const launchApp = () => appLauncher(appFunction, currentProcess, currentWorker);
  const stopApp = appStopper(currentProcess, currentWorker, log);
  const context = {currentProcess, currentWorker, log};

  [
    require('./plugins/worker-stats').worker(eventLoop, memoryUsage),
    require('./plugins/logger').worker(log)
  ].map(plugin => plugin(context));

  return engine.worker(launchApp, stopApp, log)(context);
};
