'use strict';
const rpcClient = require('./rpc-client');
const defaultTimeoutMs = 2000;

module.exports.factory = options => new RpcClientFactory(options);

class RpcClientFactory {
  constructor(options) {
    this.opts = options || {};
    this.opts.timeout = this.opts.timeout || defaultTimeoutMs;
    this.beforeRequestHooks = [];
    this.afterResponseHooks = [];
  }

  get timeout() {
    return this.opts.timeout;
  }

  registerBeforeRequestHook(fn) {
    this.beforeRequestHooks.push(fn);
  }

  registerAfterResponseHooks(fn) {
    this.afterResponseHooks.push(fn);
  }

  client() {
    const args = Array.prototype.slice.call(arguments);
    let options = {
      timeout: this.opts.timeout,
      beforeRequestHooks: this.beforeRequestHooks,
      afterResponseHooks: this.afterResponseHooks
    };
    return rpcClient.client(options, args);
  }
}