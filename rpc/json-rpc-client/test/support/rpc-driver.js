'use strict';
const rpcClient = require('../../');

module.exports.forServer = (httpServer) => {
  const baseUrl = httpServer.getUrl();


  function rpcClientFor(rpcFactory, path) {
    return rpcFactory.client(baseUrl + path);
  }

  return {
    rpcClientFor: rpcClientFor.bind(this, rpcClient.factory()),
    rpcFactoryWithHook: (hook) => {
      const factory = rpcClient.factory();
      factory.registerHeaderBuildingHook(hook);
      return {
        rpcClientFor: rpcClientFor.bind(this, factory)
      }
    }
  };
};