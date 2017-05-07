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
      .then(updateAspect(this._rpcClient.context))
      .catch(e => Promise.reject(mapError(e)));
  }
}

function updateAspect(aspects) {
  return ctx => aspects['gatekeeper'].authorize(ctx);
}

module.exports = WixGatekeeperClient;

