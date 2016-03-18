'use strict';
const jsonRpcClient = require('json-rpc-client'),
  wixRpcClientSupport = require('wix-rpc-client-support'),
  artifactNameResolver = require('./utils/artifact-name-resolver');

class WixBootstrapRpc {
  constructor(opts) {
    this.factory = jsonRpcClient.factory({timeout: opts.rpc.defaultTimeout});
    wixRpcClientSupport.get({
      rpcSigningKey: opts.rpc.signingKey,
      callerIdInfo: {
        artifactId: artifactNameResolver.resolve(), host: process.env.HOSTNAME || 'test-host.aus.wixpress.com'
      }
    }).addTo(this.factory);
  }

  rpcClient(args) {
    const client = this.factory.client.apply(this.factory, args);
    const originalInvoke = client.invoke;
    //monkeypatch rpc client to verify that context is passed.
    client.invoke = function() {
      const args = Array.prototype.slice.call(arguments);
      if (args.length > 0 && typeof args[0] === 'string') {
        throw new Error('client must be called with `req.aspects` as a first argument');
      }

      return originalInvoke.apply(client, args);
    };

    return client;
  }
}

module.exports = WixBootstrapRpc;