'use strict';
const _ = require('lodash'),
  idGenerator = require('./requestid-generator'),
  serializer = require('./serializer'),
  buildUrl = require('./url-builder').build,
  log = require('wix-logger').get('json-rpc-client'),
  Promise = require('bluebird'),
  fetch = require('node-fetch');

fetch.Promise = require('bluebird');

module.exports.client = (options, args) => new RpcClient(options, args);

class RpcClient {
  constructor(options, args) {
    this.sendHeaderHookFunctions = options.sendHeaderHookFunctions;
    this.responseHeaderHookFunctions = options.responseHeaderHookFunctions;
    this.timeout = options.timeout;
    this.url = buildUrl(args);
  }

  invoke(method) {
    const jsonRequest = RpcClient._serialize(method, _.slice(arguments, 1));
    const options = this._initialOptions(this.timeout, jsonRequest);

    this.sendHeaderHookFunctions.forEach(fn => fn(options.headers, options.body));

    fetch.Promise = Promise;
    return fetch(this.url, options)
      .then(res => {
        this.responseHeaderHookFunctions.forEach(fn => fn(res.headers._headers));
        return res;
      })
      .then(res => res.ok ? res.text() : res.text().then(text => Promise.reject(Error(`Status: ${res.status}, Response: '${text}'`))))
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

  _initialOptions(timeout, jsonRequest) {
    return {
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