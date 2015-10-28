'use strict';
var _ = require('lodash');
var rpcSigner = require('./lib/rpc-signer');

module.exports = function (signer) {
  var _rpcSigner = rpcSigner(signer, function () {
    return Date.now();
  });
  return new RpcSupportService(_rpcSigner);
};

function RpcSupportService(rpcSigner) {
  this.rpcSigner = rpcSigner;
}

RpcSupportService.prototype.addSupportToRpcClients = function (rpcFactories) {
  var self = this;
  _.forEach(arguments, function (rpcFactory) {
    rpcFactory.registerHeaderBuildingHook(function (headers, jsonBuffer) {
      self.rpcSigner.sign(jsonBuffer, headers);
    });
  });
};