var request = require('request');
var idGenerator = require('./lib/rpcRequestIdGenerator');
var rpcProtocolSerializer = require('./lib/rpcProtocolSerializer')(idGenerator);
var Promise = require('bluebird');
var _ = require('lodash');


module.exports = function rpc(signer) {
  var rpcSigner = require('./lib/rpcSigner')(signer, function(){return Date.now();});
  return new RpcClientFactory(rpcSigner);
};

function RpcClientFactory(rpcSigner) {
  this.rpcSigner = rpcSigner;
}

RpcClientFactory.prototype.rpcClient = function (url, timeout) {
  return new RpcClient(url, timeout, this.rpcSigner);
};

function RpcClient(url, timeout, rpcSigner) {
  this.url = url;
  this.timeout = timeout;
  this.rpcSigner = rpcSigner;
}

RpcClient.prototype.invoke = function (method, params) {
  return _invoke(this.url, this.rpcSigner, method, _.slice(arguments, 1))
};


function _invoke(url, rpcSigner, method, params) {

  var jsonRequest = rpcProtocolSerializer.serialize(method, params);
  var options = {
    uri: url,
    method: 'POST',
    body: jsonRequest,
    headers: {
      'Content-Type': 'application/json-rpc',
      'Accept': 'application/json-rpc'
    }
  };

  rpcSigner.sign(jsonRequest, options.headers);

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

}

