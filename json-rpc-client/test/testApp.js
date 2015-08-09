var express = require('express');
var app = express();
var jsonrpc = require('node-express-JSON-RPC2');
var signer = require('../lib/signer');
var defaults = require('./defaults')();
app.use(jsonrpc());


var rpcTokenMiddleware =  function() {
    return function(req, res, next){
        var sig = req.headers['x-wix-signature'];
        var sigCalc =  signer.sign([new Buffer(JSON.stringify(req.body)).slice(0,1024), sig.split(";")[1]], defaults.key);
        if(sig.split(";")[0] == sigCalc){
            req.validToken = true;  
        }else {
            req.validToken = false;
        }
        next();
    };
    
};

app.use(rpcTokenMiddleware());

app.post('/*', function(req, res){    
    

    res.rpc('add', function (params, respond) {
        if(req.validToken)
            respond({ result: params[0] + params[1] });
        else
            respond({
                error: {
                    code: 1565,
                    message: 'invalid token',
                    data: 'no-data'
                }
            });
    });

    res.rpc('foo', function (params, respond) {
        respond({ result: 'bar'});
    });

    
});



exports.listen = function(port, callback) {
    this.server = app.listen(port, callback);
};

exports.close = function(callback) {
    this.server.close(callback);
};