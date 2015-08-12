var express = require('express');
var _ = require('lodash');
var app = express();

exports.app = function(){
    return app;
};

exports.middlewares = function(middlewares, route){
    _.forEach(middlewares, function(m){
        if(route){
            app.use(route, m);            
        }else{
            app.use(m);            
        }        
    });        
};



exports.listen = function(port, callback) {
    this.server = app.listen(port, callback);
};

exports.close = function(callback) {
    this.server.close(callback);
};