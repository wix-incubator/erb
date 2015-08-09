var request = require('request');
var requestSigner = require('./lib/requestSigner');
var idGenerator = require('./lib/rpcRequestIdGenerator');
var rpcProtocolSerializer = require('./lib/rpcProtocolSerializer')(idGenerator);
var Promise = require('bluebird');


exports.rpcClient = function (url, opts) {

    return {
        invoke: function (method, params) {
            var time = new Date().getTime();
            /* TODO - 
             *   1. streaming / buffering                   
                 2. Advanced options - timout
                 3. default options
            */
            var jsonRequest = rpcProtocolSerializer.serialize(method, params);
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
             TODO - add catch for the json.parse
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