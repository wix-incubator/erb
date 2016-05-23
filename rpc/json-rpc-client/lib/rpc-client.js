'use strict';
const _ = require('lodash'),
  idGenerator = require('./requestid-generator'),
  serializer = require('./serializer'),
  buildUrl = require('./url-builder').build,
  log = require('wnp-debug')('json-rpc-client'),
  Promise = require('bluebird'),
  fetch = require('node-fetch'),
  errors = require('./errors'),
  assert = require('assert');

fetch.Promise = require('bluebird');

module.exports.client = (options, args) => new RpcClient(options, args);

class RpcClient {
  constructor(options, args) {
    this.beforeRequestHooks = options.beforeRequestHooks;
    this.afterResponseHooks = options.afterResponseHooks;
    this.timeout = options.timeout;
    this.url = buildUrl(args);
  }

  invoke() {
    const args = _.slice(arguments);
    assert(args.length > 0, 'At least 1 argument must be provided');
    const rpcArgs = this._parseArgs(args);

    const jsonRequest = RpcClient._serialize(rpcArgs.method, rpcArgs.methodArgs);
    const options = this._initialOptions(this.timeout, jsonRequest);
    fetch.Promise = Promise;

    return this._applyBeforeRequestHooks(options, rpcArgs.ctx)
      .then(() => this._httpPost(options))
      .then(res => this._applyAfterResponseHooks(res, rpcArgs.ctx))
      .then(res => this._textOrErrorFromHttpRequest(options, res))
      .then(resAndText => this._parseResponse(options, resAndText))
      .then(resAndJson => this._errorParser(options, resAndJson))
      .catch(err => this._logAndRethrow(err));
  }

  _parseArgs(args) {
    let ctx, method, methodArgs;

    if (_.isObject(args[0])) {
      ctx = args[0];
      method = args[1];
      methodArgs = args.length > 2 ? args.slice(2) : [];
    } else {
      method = args[0];
      methodArgs = args.length > 1 ? args.slice(1) : [];
    }

    return {ctx, method, methodArgs};
  }

  _applyBeforeRequestHooks(options, ctx) {
    return Promise.resolve(this.beforeRequestHooks.forEach(fn => fn(options.headers, options.body, ctx)));
  }

  _httpPost(options) {
    return fetch(this.url, options)
      .then(res => res)
      .catch(err => {
        return Promise.reject(new errors.RpcRequestError(this.url, options, null, err));
      });
  }

  _applyAfterResponseHooks(res, ctx) {
    this.afterResponseHooks.forEach(fn => fn(res.headers._headers, ctx));
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