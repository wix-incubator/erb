const GatekeeperAccessDenied = require('./errors').GatekeeperAccessDenied;

module.exports = e => {
  if (e.name === 'RpcError' && isAccessDenied(e)) {
    return new GatekeeperAccessDenied(e);
  } else {
    return e;
  }
};

function isAccessDenied(e) {
  return (e.code === -14 || e.code === '-14');
}
