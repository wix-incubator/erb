var rpcFactory = require('../../index');
var defaults = require('../defaults')();
var _ = require('lodash');
var server = require('../testApp');
require('./lodashCustomMixins')(_);


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


exports.rpcClientFor = function(path, options) {
    return rpcFactory.rpcClient(base_url + path, _.defaultsDeep(_.emptyIfNull(options), defaultOptions()));
};