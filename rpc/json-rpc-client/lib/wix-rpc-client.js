'use strict';
const request = require('request'),
  idGenerator = require('./lib/rpc-request-id-generator'),
  serializer = require('./lib/rpc-protocol-serializer'),
  _ = require('lodash'),
  Promise = require('bluebird');

const postAsync = Promise.promisify(request.post);
const serialize = serializer(idGenerator);

class RpcClient {
  constructor(url, timeout, sendHeaderHookFunctions) {
    this.url = url;
    this.timeout = timeout;
    this.sendHeaderHookFunctions = sendHeaderHookFunctions;
  }

  invoke(method) {
    const params = _.slice(arguments, 1);
    const jsonRequest = serialize(method, params);
    const options = this._initialOptions(this.url, jsonRequest);

    _.forEach(this.sendHeaderHookFunctions, fn => fn(options.headers));

    return postAsync(options).spread((response, body) => {
      // TODO send hook for headers response
      const json = JSON.parse(body);
      return json.result ? json.result : Promise.reject(json.error);
    });
  }

  _initialOptions(url, request) {
    return {
      uri: url,
      method: 'POST',
      body: request,
      headers: {
        'Content-Type': 'application/json-rpc',
        'Accept': 'application/json-rpc'
      }
    };
  }
}