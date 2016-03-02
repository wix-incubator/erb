'use strict';
const _ = require('lodash'),
  idGenerator = require('./requestid-generator'),
  serializer = require('./serializer'),
  buildUrl = require('./url-builder').build,
  log = require('wix-logger').get('json-rpc-client'),
  Promise = require('bluebird'),
  fetch = require('node-fetch'),
  errors = require('./errors');

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
      .then(() => this._httpPost(options))
      .then(res => this._applyResponseHeaderHooks(res))
      .then(res => this._textOrErrorFromHttpRequest(options, res))
      .then(resAndText => this._parseResponse(options, resAndText))
      .then(resAndJson => this._errorParser(options, resAndJson))
      .catch(err => this._logAndRethrow(err));
  }

  _sendHeaderHooks(options) {
    return Promise.resolve(this.sendHeaderHookFunctions.forEach(fn => fn(options.headers, options.body)));
  }

  _httpPost(options) {
    return fetch(this.url, options)
      .then(res => res)
      .catch(err => {
        return Promise.reject(new errors.RpcRequestError(this.url, options, null, err));
      });
  }

  _applyResponseHeaderHooks(res) {
    this.responseHeaderHookFunctions.forEach(fn => fn(res.headers._headers));
    return res;
  }

  _textOrErrorFromHttpRequest(reqOptions, res) {
    return res.text().then(text => {
      if (res.ok === true) {
        return {res, text};
      } else {
        return Promise.reject(new errors.RpcClientError(this.url, reqOptions, res, `Status: ${res.status}, Response: '${text}'`));
      }
    });
  }

  _parseResponse(reqOptions, resAndText) {
    try {
      return Promise.resolve({res: resAndText.res, json: JSON.parse(resAndText.text)});
    } catch (e) {
      return Promise.reject(new errors.RpcClientError(this.url, reqOptions, resAndText.res, `expected json response, instead got '${resAndText.text}'`));
    }
  }

  _errorParser(reqOptions, resAndJson) {
    return resAndJson.json.error ? Promise.reject(new errors.RpcError(this.url, reqOptions, resAndJson.res, resAndJson.json.error)) : resAndJson.json.result;
  }

  _logAndRethrow(err) {
    log.error(err);
    return Promise.reject(err);
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