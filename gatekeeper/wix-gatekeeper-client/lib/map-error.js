const RpcError = require('wix-json-rpc-client').errors.RpcError,
  GatekeeperAccessDenied = require('./errors').GatekeeperAccessDenied;

module.exports = e => {
  if (e instanceof RpcError && isAccessDenied(e)) {
    return new GatekeeperAccessDenied(e);
  } else {
    return e;
  }
};

function isAccessDenied(e) {
  return (e.code == -14);
}
