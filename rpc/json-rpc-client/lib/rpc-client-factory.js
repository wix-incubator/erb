'use strict';
const rpcClient = require('./rpc-client');
const defaultTimeoutMs = 2000;

module.exports.factory = options => new RpcClientFactory(options);

class RpcClientFactory {
  constructor(options) {
    this.opts = options || {};
    this.opts.timeout = this.opts.timeout || defaultTimeoutMs;
    this.sendHeaderHookFunctions = [];
    this.responseHeaderHookFunctions = [];
  }

  get timeout() {
    return this.opts.timeout;
  }

  registerHeaderBuildingHook(fn) {
    this.sendHeaderHookFunctions.push(fn);
  }

  registerResponseHeaderHook(fn) {
    this.responseHeaderHookFunctions.push(fn);
  }

  client() {
    const args = Array.prototype.slice.call(arguments);
    let options = {
      timeout: this.opts.timeout,
      sendHeaderHookFunctions: this.sendHeaderHookFunctions,
      responseHeaderHookFunctions: this.responseHeaderHookFunctions
    };
    return rpcClient.client(options, args);
  }
}