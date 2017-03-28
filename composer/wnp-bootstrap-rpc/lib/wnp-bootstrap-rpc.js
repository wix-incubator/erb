const jsonRpcClient = require('wix-json-rpc-client'),
  wixRpcClientSupport = require('wix-rpc-client-support'),
  rpcClientMetering = require('wix-json-rpc-metering');

module.exports = ({rpcConfiguration, hostname, artifactName, wixMeasuredFactory}, meteringEnabled = false) => {
  const factory = jsonRpcClient.factory({timeout: parseInt(rpcConfiguration.timeout)});
  
  wixRpcClientSupport.get({
    rpcSigningKey: rpcConfiguration.signingKey,
    callerIdInfo: {
      artifactId: artifactName,
      host: hostname
    }
  }).addTo(factory);
  
  if (meteringEnabled) {
    rpcClientMetering(wixMeasuredFactory).addTo(factory);
  }
  
  return factory;
};
