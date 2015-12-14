'use strict';
const cluster = require('cluster'),
    _ = require('lodash');

module.exports = opts => new WixCluster(opts);

const defaultPlugins = [
  require('./plugins/cluster-logger')(),
  require('./plugins/cluster-respawner')(),
  require('./plugins/cluster-error-handler')(),
  require('./plugins/cluster-stats')()
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

  _.forEach(plugins, plugin => {
    if (_.isFunction(plugin.onMaster)) {
      masterPlugins.push(plugin.onMaster);
    }
    if (_.isFunction(plugin.onWorker)) {
      workerPlugins.push(plugin.onWorker);
    }
  });

  this.start = () => {
    if (cluster.isMaster) {
      withPlugins(masterPlugins, cluster, forkWorkers);
      managementApp.start();
    } else {
      withPlugins(workerPlugins, cluster.worker, () => app(_.noop));
    }
  };

  function withPlugins(plugins, source, callback) {
    var call = callback;
    plugins.reverse().forEach(plugin => {
      var cb = call;
      call = () => plugin(source, cb);
    });
    call();
  }

  function forkWorkers() {
    for (var i = 0; i < workerCount; i++) {
      cluster.fork();
    }
  }
}