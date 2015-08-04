var builders = require('./builders');
var express = require('express');
var wixSession = require('wix-session')({mainKey: builders.key()});

var app = express();
var wixSessionMiddleware = require('../index')(app, wixSession);



app.use('/requireLogin', wixSessionMiddleware.process());

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