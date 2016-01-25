'use strict';
require('./lib/globals/patch-promise');
require('./lib/globals/cluster-aware-newrelic');

const BootstrapExpress = require('./lib/express'),
  BootstrapRpc = require('./lib/rpc'),
  BootstrapCluster = require('./lib/cluster'),
  bootstrapConfig = require('./lib/config/config'),
  cluster = require('cluster'),
  _ = require('lodash');

let config = undefined,
  bootstrapRpc = undefined;

module.exports.config = () => config;
module.exports.setup = setup;
module.exports.run = run;
module.exports.rpcClient = rpcClient;

function rpcClient() {
  return bootstrapRpc.rpcClient(Array.prototype.slice.call(arguments));
}

function run(appFn, cb) {
  if (!config) {
    setup({});
  }

  const callback = cb || _.noop;
  const express = new BootstrapExpress(config);
  new BootstrapCluster(config).run(express, appFn, callback);
}

function setup(opts) {
  config = bootstrapConfig.load(opts);

  if (cluster.isWorker) {
    require('wix-logging-client-support').addTo(require('wix-logging-client'));
    bootstrapRpc = new BootstrapRpc(config);
  }
}