'use strict';
const _ = require('lodash'),
  request = require('request'),
  idGenerator = require('./requestid-generator'),
  serializer = require('./serializer'),
  postAsync = require('bluebird').promisify(request.post);

const serialize = serializer.get(idGenerator);

module.exports.client = (url, timeout, sendHeaderHookFunctions) => new RpcClient(url, timeout, sendHeaderHookFunctions);

function RpcClient(url, timeout, sendHeaderHookFunctions) {
  this.url = url;
  this.timeout = timeout;
  this.sendHeaderHookFunctions = sendHeaderHookFunctions;
}

RpcClient.prototype.invoke = function (method) {
  const jsonRequest = serialize(method, _.slice(arguments, 1));
  const options = initialOptions(this.url, jsonRequest);

  this.sendHeaderHookFunctions.forEach(fn => fn(options.headers, options.body));

  return postAsync(options).spread((response, body) => {
    // TODO send hook for headers response
    const json = JSON.parse(body);
    return json.error ? Promise.reject(json.error) : json.result;
  });
};

function initialOptions(url, jsonRequest) {
  return {
    uri: url,
    method: 'POST',
    body: jsonRequest,
    headers: {
      'Content-Type': 'application/json-rpc',
      'Accept': 'application/json-rpc'
    }
  };
}
