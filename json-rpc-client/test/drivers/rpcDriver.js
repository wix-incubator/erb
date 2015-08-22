var defaults = require('../defaults')();
var signer = require('signer')(defaults.key);
var rpcFactory = require('../../index')(signer);
var server = require('../testApp');



var port = 3000;
var base_url = 'http://localhost:' + port;

var defaultOptions = function(){
    return {key: defaults.key};
};


exports.startServer = function(){
    server.listen(port);         
};

exports.stopServer = function(){
    server.close();
};


exports.rpcClientFor = function(path) {
    return rpcFactory.rpcClient(base_url + path);
};