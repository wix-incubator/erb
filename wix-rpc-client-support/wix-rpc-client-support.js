var _ = require('lodash');

/**
 * * 
 * @param rpcSigner
 * @returns {RpcSupportService}
 */
module.exports = function (signer) {
  var rpcSigner = require('./lib/rpcSigner')(signer, function(){
    return Date.now();
  });
  return new RpcSupportService(rpcSigner);
};

function RpcSupportService(rpcSigner) {
  this.rpcSigner = rpcSigner;
}

/**
 * *
 * @param rpcFactories var-args of rpc factories
 */
RpcSupportService.prototype.addSupportToRpcClients = function (rpcFactories) {
  var self = this;
  _.forEach(arguments, function (rpcFactory) {
    rpcFactory.registerHeaderBuildingHook(function (headers, jsonBuffer) {
      self.rpcSigner.sign(jsonBuffer, headers);
    });
  });
};