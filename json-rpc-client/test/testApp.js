var express = require('express');
var app = express();
var jsonrpc = require('node-express-JSON-RPC2');
app.use(jsonrpc());


app.post('/*', function(req, res){
    res.rpc('add', function (params, respond) {
        respond({ result: params[0] + params[1] });
    });

    res.rpc('validateSignature', function (params, respond) {
        respond({ result: req.headers['x-wix-signature']});
    });
});


exports.listen = function(port, callback) {
    this.server = app.listen(port, callback);
};

exports.close = function(callback) {
    this.server.close(callback);
};