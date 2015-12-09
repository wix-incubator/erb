'use strict';
const rpcClient = require('./rpc-client');
const defaultTimeoutMs = 10000;

module.exports.factory = options => new RpcClientFactory(options);

function RpcClientFactory(options) {
  this.opts = options || {};
  this.opts.timeout = this.opts.timeout || defaultTimeoutMs;
  this.sendHeaderHookFunctions = [];
}

RpcClientFactory.prototype.registerHeaderBuildingHook = function (fn) {
  this.sendHeaderHookFunctions.push(fn);
};

RpcClientFactory.prototype.client = function() {
  let args = Array.prototype.slice.call(arguments);
  return rpcClient.client(this.sendHeaderHookFunctions, this.opts, args);
};

