var express = require('express'),
    app = express(),
    wixDomain = require('wix-node-domain'),
    webContext = require('../index');

app.use(wixDomain.wixDomainMiddleware());
app.use(webContext.webContextMiddleware());


app.get('/', function(req, res) {
    res.send(webContext.webContext().requestId);
});



exports.listen = function(port, callback) {
    this.server = app.listen(port, callback);
};

exports.close = function(callback) {
    this.server.close(callback);
};