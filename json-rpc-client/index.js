var request = require('request');
var requestSigner = require('./lib/requestSigner');
var idGenerator = require('./lib/rpcRequestIdGenerator');
var rpcProtocolSerializer = require('./lib/rpcProtocolSerializer')(idGenerator);
var Promise = require('bluebird');
var _ = require('lodash');


exports.rpcClient = function (url, opts) {
  
  console.log(opts);
  var signer = require('signer')(opts.key);

  return function (method, params) {
    var time = new Date().getTime();
    var jsonRequest = rpcProtocolSerializer.serialize(method, _.slice(arguments, 1));
    var signature = signer.sign([jsonRequest, time.toString()]);
    var options = {
      uri: url,
      method: 'POST',
      body: jsonRequest,
      headers: {
        'Content-Type': 'application/json-rpc',
        'Accept': 'application/json-rpc',
        'X-Wix-Signature': signature + ';' + time.toString()
      }
    };
    /*
     TODO - add catch for the json.parse
     */
    return new Promise(function (resolve, reject) {
      request.post(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (!JSON.parse(body).error)
          resolve(JSON.parse(body).result);
        else {
          reject(JSON.parse(body).error);
        }
      });
    });
  };

};
