const loadConfiguration = require('./lib/load-configuration'),
  bootstrapRpc = require('./lib/wnp-bootstrap-rpc');

module.exports = ({env, config, timeout, log, hostname, artifactInfo, wixMeasuredFactory}) => {
  const rpcConfiguration = loadConfiguration({env, config, timeout, log});
  const callerIdInfo = {host: hostname, namespace: artifactInfo.namespace, name: artifactInfo.name};
  return bootstrapRpc({callerIdInfo, rpcConfiguration, wixMeasuredFactory}, env.ENABLE_RPC_METRICS);
};
