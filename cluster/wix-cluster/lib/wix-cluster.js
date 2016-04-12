'use strict';
const cluster = require('cluster'),
  _ = require('lodash'),
  exchange = require('wix-cluster-exchange'),
  log = require('wix-logger').get('wix-cluster');

module.exports = opts => new WixCluster(opts);

function builtinPlugins(opts) {
  return [
    require('./plugins/cluster-logger')(),
    require('./plugins/cluster-respawner')(exchange),
    require('./plugins/cluster-error-handler')(),
    require('./plugins/cluster-stats')(exchange),
    require('./plugins/cluster-client-notifier')(opts)
  ];
}

const noopManagementApp = {start: done => done()};

//TODO: validate input
function WixCluster(opts) {
  const defaultPlugins = builtinPlugins(opts);
  const workerPlugins = [];
  const masterPlugins = [];

  const managementApp = opts.managementApp || noopManagementApp;

  buildPlugins(opts).forEach(plugin => {
    if (_.isFunction(plugin.onMaster)) {
      masterPlugins.push(plugin);
    }
    if (_.isFunction(plugin.onWorker)) {
      workerPlugins.push(plugin);
    }
  });

  this.start = done => {
    const cb = done || _.noop;
    if (cluster.isMaster) {
      withPlugins(masterPlugins, 'onMaster', cluster, err => {
        managementApp.start(mgmtAppError => cb(err || mgmtAppError));
      });
    } else {
      withPlugins(workerPlugins, 'onWorker', cluster.worker, cb);
    }
  };

  function withPlugins(plugins, fnName, source, callback) {
    const current = _.head(plugins);
    const rest = _.tail(plugins);

    if (current) {
      try {
        current[fnName](source, err => {
          if (err) {
            log.error('Failed to start app', err);
            callback(err);
          } else {
            withPlugins(rest, fnName, source, callback);
          }
        });
      } catch (e) {
        log.error('Failed to start app', e);
        callback(e);
      }
    } else {
      callback();
    }
  }

  function buildPlugins(opts) {
    let plugins = defaultPlugins;
    const workerCount = opts.workerCount || 2;

    if (opts.withoutDefaultPlugins && opts.withoutDefaultPlugins === true) {
      plugins = [];
    }
    plugins = plugins.concat(opts.plugins || []);
    plugins.push(new ClientAppLauncher(opts.app));
    plugins.push(new WorkerSpawner(workerCount));
    return plugins;
  }
}

function ClientAppLauncher(appFn) {
  this.onWorker = (worker, next) => appFn(next);
}

function WorkerSpawner(workerCount) {
  this.onMaster = (source, next) => {
    for (var i = 0; i < workerCount; i++) {
      cluster.fork();
    }
    next();
  };
}