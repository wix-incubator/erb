'use strict';
const cluster = require('cluster'),
    _ = require('lodash'),
  exchange = require('wix-cluster-exchange');

module.exports = opts => new WixCluster(opts);

const defaultPlugins = [
  require('./plugins/cluster-logger')(),
  require('./plugins/cluster-respawner')(exchange),
  require('./plugins/cluster-error-handler')(),
  require('./plugins/cluster-stats')(exchange)
];

const noopManagementApp = { start: _.noop };

//TODO: validate input
function WixCluster(opts) {
   let plugins = defaultPlugins;

  if (opts.withoutDefaultPlugins && opts.withoutDefaultPlugins === true) {
    plugins = [];
  }
  plugins = plugins.concat(opts.plugins || []);
  const workerPlugins = [];
  const masterPlugins = [];

  const workerCount = opts.workerCount || 2;
  const app = opts.app;
  const managementApp = opts.managementApp || noopManagementApp;


  plugins.forEach(plugin => {
    if (_.isFunction(plugin.onMaster)) {
      masterPlugins.push(plugin);
    }
    if (_.isFunction(plugin.onWorker)) {
      workerPlugins.push(plugin);
    }
  });

  this.start = () => {
    if (cluster.isMaster) {
      withMasterPlugins(masterPlugins, cluster, forkWorkers);
      managementApp.start();
    } else {
      withWorkerPlugins(workerPlugins, cluster.worker, () => app(_.noop));
    }
  };

  function withMasterPlugins(plugins, source, callback) {
    var call = callback;
    plugins.reverse().forEach(plugin => {
      var cb = call;
      call = () => plugin.onMaster(source, cb);
    });
    call();
  }

  function withWorkerPlugins(plugins, source, callback) {
    var call = callback;
    plugins.reverse().forEach(plugin => {
      var cb = call;
      call = () => plugin.onWorker(source, cb);
    });
    call();
  }


  function forkWorkers() {
    for (var i = 0; i < workerCount; i++) {
      cluster.fork();
    }
  }
}