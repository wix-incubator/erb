var request = require('request');
var idGenerator = require('./lib/rpcRequestIdGenerator');
var rpcProtocolSerializer = require('./lib/rpcProtocolSerializer')(idGenerator);
var _ = require('lodash');
var Promise = require('bluebird');
var postAsync = Promise.promisify(request.post);


/**
 * *
 * @param signer object
 * @returns {RpcClientFactory}
 */
module.exports = function rpc() {
  return new RpcClientFactory();
};

function RpcClientFactory() {
  this.sendHeaderHookFunctions = [];
}

RpcClientFactory.prototype.registerHeaderBuildingHook = function(f){
  this.sendHeaderHookFunctions.push(f);
};

/**
 * *
 * @param url for the service
 * @param timeout in milliseconds
 * @returns {RpcClient}
 */
RpcClientFactory.prototype.rpcClient = function (url, timeout) {
  return new RpcClient(url, timeout, this.sendHeaderHookFunctions);
};


function RpcClient(url, timeout, sendHeaderHookFunctions) {
  this.url = url;
  this.timeout = timeout;
  this.sendHeaderHookFunctions = sendHeaderHookFunctions;
}

/**
 * *
 * @param method name
 * @param params varargs of parameters
 * @returns Promise of rpc response
 */
RpcClient.prototype.invoke = function (method, params) {
  return _invoke(this.url, method, this.sendHeaderHookFunctions, _.slice(arguments, 1))
};


function _invoke(url, method,sendHeaderHookFunctions, params) {  
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
    
  _.forEach(sendHeaderHookFunctions, function(f){
    f(headers, jsonRequest);
  });
    
  options.headers = headers;

  return postAsync(options).spread(function (response, body) {
    // TODO send hook for headers response
    var json = JSON.parse(body);
    return json.result ? json.result : Promise.reject(json.error);
  });

}

