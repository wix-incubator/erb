'use strict';

class BaseRpcError extends Error {
  constructor(reqUri, reqOptions, fetchRes, msg) {
    super();
    this.metadata = [];
    this.name = this.constructor.name;
    this.metadata.push(msg);
    this.addToDataIfAny('request uri', reqUri);
    this.addToDataIfAny('request options', reqOptions ? tryStringify(reqOptions) : reqOptions);
    this.addToDataIfAny('response headers', (fetchRes && fetchRes.headers) ? tryStringify(fetchRes.headers.raw()) : undefined);
  }

  get message() {
    return this.metadata.join(', ');
  }

  addToDataIfAny(key, value) {
    if (value) {
      this.metadata.push(`${key}: '${value}'`);
    }
  }

}

class RpcClientError extends BaseRpcError {
  constructor(reqUri, reqOptions, fetchRes, msg) {
    super(reqUri, reqOptions, fetchRes, msg);
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class RpcError extends BaseRpcError {
  constructor(reqUri, reqOptions, fetchRes, jsonRpcErrorObject) {
    super(reqUri, reqOptions, fetchRes, jsonRpcErrorObject.message);
    this.addToDataIfAny('error code', jsonRpcErrorObject.code);
    this.addToDataIfAny('response data', tryStringify(jsonRpcErrorObject.data));
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class RpcRequestError extends BaseRpcError {
  constructor(reqUri, reqOptions, fetchRes, err) {
    super(reqUri, reqOptions, fetchRes, err.message);
    Error.captureStackTrace(this, this.constructor.name);
  }
}

function tryStringify(data) {
  try {
    if (data) {
      return JSON.stringify(data);
    }
  } catch (e) {
    return data;
  }
}

module.exports.RpcError = RpcError;
module.exports.RpcClientError = RpcClientError;
module.exports.RpcRequestError = RpcRequestError;