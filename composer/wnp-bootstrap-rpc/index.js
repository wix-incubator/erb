const loadConfiguration = require('./lib/load-configuration'),
  bootstrapRpc = require('./lib/wnp-bootstrap-rpc');

module.exports = ({env, config, timeout, log, hostname, artifactName, wixMeasuredFactory}) => {
  const rpcConfiguration = loadConfiguration({env, config, timeout, log});
  return bootstrapRpc({artifactName, hostname, rpcConfiguration, wixMeasuredFactory}, env.ENABLE_RPC_METRICS);
};
