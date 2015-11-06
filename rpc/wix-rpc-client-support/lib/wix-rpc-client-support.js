'use strict';
const _ = require('lodash'),
  rpcSigner = require('./rpc-request-signer');

module.exports = signer => {
  const _rpcSigner = rpcSigner(signer, () => Date.now());
  return new RpcSupportService(_rpcSigner);
};

function RpcSupportService(rpcSigner) {
  this.rpcSigner = rpcSigner;
}

RpcSupportService.prototype.addSupportToRpcClients = function (rpcFactories) {
  _.slice(arguments).forEach(rpcFactory => {
    rpcFactory.registerHeaderBuildingHook((headers, jsonBuffer) => self.rpcSigner.sign(jsonBuffer, headers));
  });
};