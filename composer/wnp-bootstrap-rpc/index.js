const loadConfiguration = require('./lib/load-configuration'),
  bootstrapRpc = require('./lib/wnp-bootstrap-rpc');

module.exports = ({env, config, timeout, log, hostname, artifactName}) => {
  const rpcConfiguration = loadConfiguration({env, config, timeout, log});
  return bootstrapRpc({artifactName, hostname, rpcConfiguration});
}
