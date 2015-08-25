var _ = require('lodash');

module.exports = function () {
  return {
    addSupportToRpcClients: addSupportToRpcClients
  }

};

var addSupportToRpcClients = function (rpcFactories) {
  _.forEach(arguments, function (rpcFactory) {
    rpcFactory.registerHeaderBuildingHook(function (headers, jsonBuffer) {
      headers['kfir'] = 'ddddd';
    });
  });
};