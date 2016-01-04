'use strict';
const _ = require('lodash'),
  idGenerator = require('./requestid-generator'),
  serializer = require('./serializer'),
  rp = require('request-promise'),
  buildUrl = require('./url-builder').build,
  log = require('wix-logger').get('json-rpc-client');

module.exports.client = (sendHeaderHookFunctions, options, args) => new RpcClient(sendHeaderHookFunctions, options, args);

class RpcClient {
  constructor(sendHeaderHookFunctions, options, args) {
    this.sendHeaderHookFunctions = sendHeaderHookFunctions;
    this.timeout = options.timeout;
    this.url = buildUrl(args);
  }

  invoke(method) {
    const jsonRequest = RpcClient._serialize(method, _.slice(arguments, 1));
    const options = this._initialOptions(this.url, this.timeout, jsonRequest);

    this.sendHeaderHookFunctions.forEach(fn => fn(options.headers, options.body));

    return rp(options)
      .then(this._parseResponse)
      .then(json => json.error ? Promise.reject(new RpcError(json.error)) : json.result);
  }

  _parseResponse(responseText) {
    try {
      return Promise.resolve(JSON.parse(responseText));
    } catch (e) {
      const error = Error(`expected json response, instead got '${responseText}'`);
      log.error(error);
      return Promise.reject(error);
    }
  }

  static get _serialize() {
    return serializer.get(idGenerator);
  }

  _initialOptions(url, timeout, jsonRequest) {
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
}

class RpcError extends Error {
  constructor(jsonRpcErrorObject) {
    super(jsonRpcErrorObject.message);
    this.name = this.constructor.name;
    this.code = jsonRpcErrorObject.code;
    this.data = jsonRpcErrorObject.data;
    Error.captureStackTrace(this, this.constructor.name);
  }
}