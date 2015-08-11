var express = require('express');
var domainHelper = require('../index');
var app = express();
var port = 3030;


app.use(domainHelper.wixDomainMiddleware());

exports.listen = function(port, callback) {
    this.server = app.listen(port, callback);
};

exports.close = function(callback) {
    this.server.close(callback);
};

app.get('/domainName', function (req, res) {
    res.send(domainHelper.wixDomain().name);
});
