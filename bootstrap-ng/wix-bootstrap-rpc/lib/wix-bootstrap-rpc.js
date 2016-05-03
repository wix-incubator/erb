'use strict';
const jsonRpcClient = require('wix-json-rpc-client'),
  wixRpcClientSupport = require('wix-rpc-client-support'),
  artifactNameResolver = require('./artifact-name-resolver');

module.exports = (context, opts) => {
  const factory = jsonRpcClient.factory({timeout: opts.timeout});
  wixRpcClientSupport.get({
    rpcSigningKey: opts.rpcSigningKey,
    callerIdInfo: {
      artifactId: artifactNameResolver.resolve(), host: context.env.hostname || 'test-host.aus.wixpress.com'
    }
  }).addTo(factory);
  return factory;
};