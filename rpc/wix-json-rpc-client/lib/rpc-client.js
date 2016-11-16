const _ = require('lodash'),
  idGenerator = require('./requestid-generator'),
  serializer = require('./serializer'),
  fetch = require('node-fetch'),
  errors = require('./errors'),
  assert = require('assert');

module.exports.client = (options, context) => new RpcClient(options, context);

class RpcClient {
  constructor(options, context) {
    this.beforeRequestHooks = options.beforeRequestHooks;
    this.afterResponseHooks = options.afterResponseHooks;
    this.timeout = options.timeout;
    this.url = options.url;
    this.context = context;
  }

  invoke() {
    const args = _.slice(arguments);
    assert(args.length > 0, 'At least 1 argument must be provided');
    const method = args[0];
    const methodArgs = args.length > 1 ? args.slice(1) : [];

    const jsonRequest = RpcClient._serialize(method, methodArgs);
    const options = this._initialOptions(this.timeout, jsonRequest);

    return this._applyBeforeRequestHooks(options, this.context)
      .then(() => this._httpPost(options))
      .then(res => this._applyAfterResponseHooks(res, this.context))
      .then(res => this._textOrErrorFromHttpRequest(options, res))
      .then(resAndText => this._parseResponse(options, resAndText))
      .then(resAndJson => this._errorParser(options, resAndJson))
      .catch(e => {
      console.log('json2', e instanceof errors.RpcError);
      return Promise.reject(e);
    });
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
