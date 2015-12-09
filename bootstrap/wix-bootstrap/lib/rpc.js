'use strict';
const jsonRpcClient = require('json-rpc-client'),
  wixRpcClientSupport = require('wix-rpc-client-support');

class WixBootstrapRpc {
  constructor(opts) {
    this.factory = jsonRpcClient.factory({timeout: opts.rpc.defaultTimeout});

    wixRpcClientSupport.get({rpcSigningKey: opts.rpc.signingKey}).addTo(this.factory);
  }

  rpcClient(args) {
    return this.factory.client.apply(this.factory, args);
  }
}

module.exports = WixBootstrapRpc;