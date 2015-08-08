var JsonRpcRequest = require('json-rpc-request');
var request = require('request');
var requestSigner = require('./lib/requestSigner');
var Promise = require('bluebird');


exports.rpcClient = function (url, oo) {

    return {
        invoke: function (method, params) {
            var time = new Date().getTime();
            var jsonRequest = JSON.stringify(new JsonRpcRequest(1, method, params));
            var signature = requestSigner.sign(jsonRequest, time.toString(), oo.key);
            var options = {
                uri: url,
                method: 'POST',
                body: jsonRequest,
                headers: {
                    'Content-Type': 'application/json-rpc',
                    'Accept': 'application/json-rpc',
                    'X-Wix-Signature': signature.headerValue
                }
            };

            return new Promise(function(resolve, reject){
                request.post(options, function (error, response, body) {
                    if(!JSON.parse(body).error)
                        resolve(JSON.parse(body).result);
                    else{
                        reject(JSON.parse(body).error);
                    }
                });
            });



        }

    };

}