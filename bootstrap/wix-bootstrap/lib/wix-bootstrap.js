'use strict';
const bootstrapExpress = require('./express'),
  bootstrapRpc = require('./rpc'),
  wixLoggingClientSupport = require('wix-logging-client-support'),
  wixLoggingClient = require('wix-logging-client'),
  bootstrapConfig = require('./config');

let rpc, express, config;

module.exports.config = () => config;
module.exports.setup = opts => setup(opts);
module.exports.run = expressFn => express.run(expressFn);
module.exports.rpcClient = (url, timeout) => rpc.rpcClient(url, timeout);

function setup(opts) {
  config = bootstrapConfig.load(opts);

  setupLogging();

  express = bootstrapExpress(config);
  rpc = bootstrapRpc(config);
}

function setupLogging() {
  wixLoggingClientSupport.addTo(wixLoggingClient);
}