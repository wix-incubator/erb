'use strict';
const jsonRpcClient = require('json-rpc-client'),
  wixRpcClientSupport = require('wix-rpc-client-support');

class WixBootstrapRpc {
  constructor(opts) {
    this.timeout = opts.rpc.defaultTimeout;
    this.factory = jsonRpcClient.factory();

    wixRpcClientSupport.get({rpcSigningKey: opts.rpc.signingKey}).addTo(this.factory);
  }

  rpcClient(url, timeout) {
    return this.factory.client(url, timeout || this.timeout);
  }
}

module.exports = opts => new WixBootstrapRpc(opts);
