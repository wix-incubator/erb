'use strict';
const BootstrapExpress = require('./lib/bootstrap-express'),
  BootstrapRpc = require('./lib/bootstrap-rpc'),
  BootstrapCluster = require('./lib/bootstrap-cluster'),
  bootstrapConfig = require('./lib/config'),
  cluster = require('cluster');

let config = undefined,
  bootstrapRpc = undefined;

module.exports.config = () => config;
module.exports.setup = setup;
module.exports.run = run;
module.exports.rpcClient = rpcClient;

function rpcClient(url, timeout) {
  return bootstrapRpc.rpcClient(url, timeout);
}

function run(appFn, setupFn) {
  const express = new BootstrapExpress(config, config);
  new BootstrapCluster(config, express).run(appFn, setupFn);
}

function setup(opts) {
  config = bootstrapConfig.load(opts);

  if (cluster.isWorker) {
    require('wix-logging-client-support').addTo(require('wix-logging-client'));
    bootstrapRpc = new BootstrapRpc(config);
  }
}