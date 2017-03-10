const rpcClient = require('./rpc-client'),
  buildUrl = require('./url-builder').build,
  assert = require('assert'),
  _ = require('lodash');

const defaultTimeoutMs = 2000;

module.exports.factory = options => new JsonRpcClientFactory(options);

class JsonRpcClientFactory {
  constructor(opts) {
    this.opts = Object.assign({}, {timeout: defaultTimeoutMs}, opts);
    assert(_.isInteger(this.opts.timeout), 'Provided timeout must be integer.');

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

  clientFactory() {
    const args = Array.prototype.slice.call(arguments);
    const options = {
      timeout: this.opts.timeout,
      beforeRequestHooks: this.beforeRequestHooks,
      afterResponseHooks: this.afterResponseHooks,
      url: buildUrl(args)
    };

    return {
      client: context => rpcClient.client(options, context)
    };
  }
}
