'use strict';
const _ = require('lodash'),
  request = require('request'),
  idGenerator = require('./requestid-generator'),
  serializer = require('./serializer'),
  postAsync = require('bluebird').promisify(request.post),
  buildUrl = require('./url-builder').build;

const serialize = serializer.get(idGenerator);

module.exports.client = (sendHeaderHookFunctions, options, args) => new RpcClient(sendHeaderHookFunctions, options, args);

function RpcClient(sendHeaderHookFunctions, options, args) {
  this.sendHeaderHookFunctions = sendHeaderHookFunctions;
  this.timeout = options.timeout;
  this.url = buildUrl(args);
}

RpcClient.prototype.invoke = function (method) {
  const jsonRequest = serialize(method, _.slice(arguments, 1));
  const options = initialOptions(this.url, this.timeout, jsonRequest);

  this.sendHeaderHookFunctions.forEach(fn => fn(options.headers, options.body));

  //TODO: no need here for bluebirdm spread - just use request-promise
  return postAsync(options).spread((res, body) => {
    if (res.statusCode < 200 || res.statusCode > 299) {
      return Promise.reject(Error(`statusCode: ${res.statusCode}, statusMessage: ${res.statusMessage}`));
    } else {
      try {

        const json = JSON.parse(body);
        return json.error ? Promise.reject(json.error) : json.result;
      } catch (e) {
        return Promise.reject(Error(`expected json response, instead got '${body}'`));
      }
    }
  });
};

function initialOptions(url, timeout, jsonRequest) {
  return {
    uri: url,
    method: 'POST',
    body: jsonRequest,
    timeout: timeout,
    headers: {
      'Content-Type': 'application/json-rpc',
      'Accept': 'application/json-rpc'
    }
  };
}