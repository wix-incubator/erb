var builders = require('./builders'),
    express = require('express'),
    wixDomain = require('wix-node-domain'),
    wixSessionMiddleware = require('../index')({mainKey: builders.key()});


var app = express();

app.use(wixDomain.wixDomainMiddleware());
app.use('/requireLogin', wixSessionMiddleware.middleware());



app.get('/requireLogin', function(req, res) {
    res.send(wixSessionMiddleware.session().userGuid);
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