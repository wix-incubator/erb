'use strict';

var rpcFactory = require('../../jsonRpcClient');
var server = require('../testApp');

var port = 3000;
var baseUrl = 'http://localhost:' + port;

exports.startServer = function(){
    server.listen(port);
};

exports.stopServer = function(){
    server.close();
};

exports.rpcClientFor = rpcClientFor.bind(this, rpcFactory);

exports.rpcFactoryWithHook = function(hook) {
    var rpcFactory = require('../../jsonRpcClient');

    rpcFactory.registerHeaderBuildingHook(hook);

    return {
        rpcClientFor: rpcClientFor.bind(this, rpcFactory)
    };
};

function rpcClientFor (rpcFactory, path) {
    return rpcFactory.rpcClient(baseUrl + path);
}