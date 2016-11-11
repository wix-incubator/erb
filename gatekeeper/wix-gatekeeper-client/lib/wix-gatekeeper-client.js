const mapError = require('./map-error'),
  assert = require('assert');

class WixGatekeeperClient {
  constructor(rpcClient) {
    this._rpcClient = rpcClient;
  }

  authorize(metasite, permission) {
    assert(metasite, 'metasiteId must be provided');
    assert(permission, 'permission must be provided');
    assert(permission.scope, 'permission.scope must be provided');
    assert(permission.action, 'permission.action must be provided');
    return this._rpcClient
        .invoke('authorize', metasite, permission)
        .then(() => {})
        .catch(e => Promise.reject(mapError(e)));
  }
}

module.exports = WixGatekeeperClient;
