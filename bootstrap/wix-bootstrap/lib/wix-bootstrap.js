'use strict';
const bootstrapExpress = require('./express'),
  bootstrapRpc = require('./rpc'),
  wixLoggingClientSupport = require('wix-logging-client-support'),
  wixLoggingClient = require('wix-logging-client');

let rpc, express;

module.exports.setup = opts => setup(opts);
module.exports.run = expressFn => express.run(expressFn);
module.exports.rpcClient = (url, timeout) => rpc.rpcClient(url, timeout);

function setup(opts) {
  let options = loadOptions(opts);

  setupLogging();

  express = bootstrapExpress(options);
  rpc = bootstrapRpc(options);
}

function setupLogging() {
  wixLoggingClientSupport.addTo(wixLoggingClient);
}

function loadOptions(opts) {
  return opts;
}