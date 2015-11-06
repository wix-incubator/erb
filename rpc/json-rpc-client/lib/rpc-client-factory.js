'use strict';
const rpcClient = require('./rpc-client');

module.exports.factory = () => new RpcClientFactory();

function RpcClientFactory() {
  this.sendHeaderHookFunctions = [];
}

RpcClientFactory.prototype.registerHeaderBuildingHook = function (fn) {
  this.sendHeaderHookFunctions.push(fn);
};

RpcClientFactory.prototype.client = function (url, timeout) {
  return rpcClient.client(url, timeout, this.sendHeaderHookFunctions);
};

