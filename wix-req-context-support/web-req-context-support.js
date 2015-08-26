var _ = require('lodash');
var reqContext = require('wix-req-context');

module.exports = function () {
  return {
    addSupportToRpcClients: addSupportToRpcClients
  }

};

var addSupportToRpcClients = function (rpcFactories) {
  _.forEach(arguments, function (rpcFactory) {
    rpcFactory.registerHeaderBuildingHook(function (headers, jsonBuffer) {
      headers['X-Wix-Request-Id'] = reqContext.reqContext().requestId
    });
  });
};