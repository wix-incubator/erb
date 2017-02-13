const jsonRpcClient = require('wix-json-rpc-client'),
  wixRpcClientSupport = require('wix-rpc-client-support');

module.exports = ({rpcConfiguration, hostname, artifactName}) => {
  const factory = jsonRpcClient.factory({timeout: parseInt(rpcConfiguration.timeout)});
  wixRpcClientSupport.get({
    rpcSigningKey: rpcConfiguration.signingKey,
    callerIdInfo: {
      artifactId: artifactName,
      host: hostname
    }
  }).addTo(factory);
  return factory;
};
