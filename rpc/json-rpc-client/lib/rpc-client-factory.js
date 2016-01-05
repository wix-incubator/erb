'use strict';
const rpcClient = require('./rpc-client');
const defaultTimeoutMs = 2000;

module.exports.factory = options => new RpcClientFactory(options);

class RpcClientFactory {
  constructor(options) {
    this.opts = options || {};
    this.opts.timeout = this.opts.timeout || defaultTimeoutMs;
    this.sendHeaderHookFunctions = [];
  }

  get timeout() {
    return this.opts.timeout;
  }

  registerHeaderBuildingHook(fn) {
    this.sendHeaderHookFunctions.push(fn);
  }

  client() {
    const args = Array.prototype.slice.call(arguments);
    return rpcClient.client(this.sendHeaderHookFunctions, this.opts, args);
  }
}