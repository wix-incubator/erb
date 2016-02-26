'use strict';
const _ = require('lodash'),
  idGenerator = require('./requestid-generator'),
  serializer = require('./serializer'),
  buildUrl = require('./url-builder').build,
  log = require('wix-logger').get('json-rpc-client'),
  Promise = require('bluebird'),
  fetch = require('node-fetch'),
  RpcError = require('./rpc-error');

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
    fetch.Promise = Promise;

    return this._sendHeaderHooks(options)
      .then(() => this._httpPost(this.url, options))
      .then(res => this._applyResponseHeaderHooks(res))
      .then(res => this._textOrErrorFromHttpRequest(res))
      .then(payload => this._parseResponse(payload))
      .then(json => this._errorParser(this.url, options, json));
  }

  _sendHeaderHooks(options) {
    return Promise.resolve(this.sendHeaderHookFunctions.forEach(fn => fn(options.headers, options.body)));
  }

  _httpPost(url, options) {
    return fetch(url, options);
  }

  _applyResponseHeaderHooks(res) {
    this.responseHeaderHookFunctions.forEach(fn => fn(res.headers._headers));
    return res;
  }

  _textOrErrorFromHttpRequest(res) {
    return res.ok ? res.text() : res.text().then(text => Promise.reject(Error(`Status: ${res.status}, Response: '${text}'`)));
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

  _errorParser(reqUri, reqOptions, responseJson) {
    return responseJson.error ? Promise.reject(new RpcError(reqUri, reqOptions, responseJson.error)) : responseJson.result;
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