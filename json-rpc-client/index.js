var JsonRpcRequest = require('json-rpc-request');
var request = require('request');
var requestSigner = require('./lib/requestSigner');
var Promise = require('bluebird');


exports.rpcClient = function (url) {

    return {
        invoke: function (method, params) {
            var time = new Date().getTime();
            var jsonRequest = JSON.stringify(new JsonRpcRequest(1, method, params));
            var signature = requestSigner.sign(jsonRequest, time.toString(), "84ts5GtipZZC");
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

            return new Promise(function(resolve){
                request.post(options, function (error, response, body) {
                    resolve(JSON.parse(body).result);
                });
            });



        }

    };

}