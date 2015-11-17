'use strict';
const cluster = require('cluster'),
    _ = require('lodash'),
    logger = require('./plugins/cluster-logger'),
    respawner = require('./plugins/cluster-respawner'),
    errorHandler = require('./plugins/cluster-error-handler'),
    stats = require('./plugins/cluster-stats'),
    managementAppBuilder = require('wix-management-app').builder;

module.exports.builder = app => {
  return new WixClusterBuilder(app);
};

function WixCluster(app, managementApp, plugins, workerCount) {
  var forkCount = workerCount;
  var mainApp = app;
  var mgmtApp = managementApp;
  var workerPlugins = [];
  var masterPlugins = [];

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
      mgmtApp.start();
    } else {
      withPlugins(workerPlugins, cluster.worker, mainApp);
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
    for (var i = 0; i < forkCount; i++) {
      cluster.fork();
    }
  }
}

function WixClusterBuilder(app) {
  var workerCount = 2;
  var addDefaultPlugins = true;
  var plugins = [];
  var managementRouters = [];
  var managementApp;

  this.withoutDefaultPlugins = () => {
    addDefaultPlugins = false;
    return this;
  };

  this.addPlugin = plugin => {
    plugins.push(plugin);
    return this;
  };

  this.withManagementApp = app => {
    managementApp = app;
    return this;
  };

  this.withManagementRouter = router => {
    managementRouters.push(router);
    return this;
  };

  this.withWorkerCount = count => {
    workerCount = count;
    return this;
  };

  this.start = () => {
    if (addDefaultPlugins) {
      plugins = plugins.concat(defaultPlugins());
    }

    return new WixCluster(app, managementApp || managementAppBuilder().addPages(managementRouters).build(), plugins, workerCount).start();
  };

  function defaultPlugins() {
    return [logger(), stats(), errorHandler(), respawner()];
  }
}