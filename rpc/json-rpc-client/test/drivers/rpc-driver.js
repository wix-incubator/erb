'use strict';

var RpcClientFactory = require('../../');
var server = require('../test-app');

var port = 3000;
var baseUrl = 'http://localhost:' + port;

var defaultRpcFactoryInstance = new RpcClientFactory();

exports.startServer = function(){
    server.listen(port);
};

exports.stopServer = function(){
    server.close();
};

exports.rpcClientFor = rpcClientFor.bind(this, defaultRpcFactoryInstance);

exports.rpcFactoryWithHook = function(hook) {
    var rpcFactoryWithHooks = new RpcClientFactory();

    rpcFactoryWithHooks.registerHeaderBuildingHook(hook);

    return {
        rpcClientFor: rpcClientFor.bind(this, rpcFactoryWithHooks)
    };
};

function rpcClientFor (rpcFactory, path) {
    return rpcFactory.rpcClient(baseUrl + path);
}