var express = require('express');
var _ = require('lodash');

var defaultOptions = {
    port: 3333
};

var listen = function(app, port) {
    return app.listen(port);
};

var close = function(server){
    server.close();
};

module.exports = function(options){
    var app = express();
    var mergedOptions = _.merge(defaultOptions, options);
    var server = {};
    return {
        getApp: function(){
            return app;
        },
        listen: function() {
            server = listen(app, mergedOptions.port);
        },
        close: function() {
            close(server);
        },
        beforeAndAfterEach: function(){
            beforeEach(function(){
                server = listen(app, mergedOptions.port);
            });
            afterEach(function(){
                close(server);
            });
        },
        beforeAndAfter: function(){
            before(function(){
                server = listen(app, mergedOptions.port);
            });
            after(function(){
                close(server);
            });
        }
    };
};

