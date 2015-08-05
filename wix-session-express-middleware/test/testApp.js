var builders = require('./builders');
var express = require('express');


var app = express();
var wixSessionMiddleware = require('../index');
wixSessionMiddleware.init(app, '/requireLogin', {mainKey: builders.key()});


app.get('/requireLogin', function(req, res) {
    res.send(req.wixSession.userGuid);
});

app.get('/notRequireLogin', function(req, res) {
    res.send("no need to login");
});


exports.listen = function(port, callback) {
    this.server = app.listen(port, callback);
};

exports.close = function(callback) {
    this.server.close(callback);
};