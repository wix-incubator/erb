var JsonRpcRequest = require('json-rpc-request');
var request = require('request');
var requestSigner = require('./lib/requestSigner');
var Promise = require('bluebird');


exports.rpcClient = function (url, opts) {

    return {
        invoke: function (method, params) {
            var time = new Date().getTime();
            /* TODO - 
             *   1. streaming / bufferinf
                 2. generate id  
                 3. Advanced options - timout
            */
            var jsonRequest = JSON.stringify(new JsonRpcRequest(1, method, params)); 
            var signature = requestSigner.sign(jsonRequest, time.toString(), opts.key);
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
            /*
             TODO - error handling, catch exception, catch error 
             */
            return new Promise(function(resolve, reject){
                request.post(options, function (error, response, body) {
                    if(error){
                        reject(error);
                    } else if(!JSON.parse(body).error)
                        resolve(JSON.parse(body).result);
                    else{
                        reject(JSON.parse(body).error);
                    }
                });
            });



        }

    };

}