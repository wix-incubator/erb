var request = require('request');
var idGenerator = require('./lib/rpcRequestIdGenerator');
var rpcProtocolSerializer = require('./lib/rpcProtocolSerializer')(idGenerator);
var Promise = require('bluebird');
var _ = require('lodash');


module.exports = function rpc(signer) {
  return new RpcClientFactory(signer);
};

function RpcClientFactory(signer) {
  this.signer = signer;
}

RpcClientFactory.prototype.rpcClient = function (url, timeout) {
  return new RpcClient(url, timeout, this.signer);
};

function RpcClient(url, timeout, signer) {
  this.url = url;
  this.timeout = timeout;
  this.signer = signer;
}

RpcClient.prototype.invoke = function (method, params) {
  return _rpc(this.url, this.signer, method, _.slice(arguments, 1))
};


function _rpc(url, signer, method, params) {

  var time = new Date().getTime();
  var jsonRequest = rpcProtocolSerializer.serialize(method, params);
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

}

