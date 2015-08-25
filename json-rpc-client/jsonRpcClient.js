var request = require('request');
var rpcProtocolSerializer = require('./lib/rpcProtocolSerializer')(require('./lib/rpcRequestIdGenerator'));
var _ = require('lodash');
var rpcSigner = require('./lib/rpcSigner');
var Promise = require('bluebird');
var postAsync = Promise.promisify(request.post);


/**
 * *
 * @param signer object
 * @returns {RpcClientFactory}
 */
module.exports = function rpc(signer) {
  return new RpcClientFactory(rpcSigner(signer, function () {
    return Date.now();
  }));
};

function RpcClientFactory(rpcSigner) {
  this.rpcSigner = rpcSigner;
}

/**
 * *
 * @param url for the service
 * @param timeout in milliseconds
 * @returns {RpcClient}
 */
RpcClientFactory.prototype.rpcClient = function (url, timeout) {
  return new RpcClient(url, timeout, this.rpcSigner);
};

function RpcClient(url, timeout, rpcSigner) {
  this.url = url;
  this.timeout = timeout;
  this.rpcSigner = rpcSigner;
}

/**
 * *
 * @param method name
 * @param params varargs of parameters
 * @returns Promise of rpc response
 */
RpcClient.prototype.invoke = function (method, params) {
  return _invoke(this.url, this.rpcSigner, method, _.slice(arguments, 1))
};


function _invoke(url, rpcSigner, method, params) {

  var jsonRequest = rpcProtocolSerializer.serialize(method, params);

  var options = {
    uri: url,
    method: 'POST',
    body: jsonRequest
  };
  
  var headers = {
    'Content-Type': 'application/json-rpc',
    'Accept': 'application/json-rpc'    
  };
  rpcSigner.sign(jsonRequest, headers);
  
  // TODO send more headers with contexts
  
  options.headers = headers;

  return postAsync(options).spread(function (response, body) {
    // TODO get petri cookie and save to domain/context
    var json = JSON.parse(body);
    return json.result ? json.result : Promise.reject(json.error);
  });

}

