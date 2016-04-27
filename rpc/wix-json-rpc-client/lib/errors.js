'use strict';

class BaseRpcError extends Error {
  constructor(reqUri, reqOptions, fetchRes, msg) {
    super(msg);
    this.name = this.constructor.name;
    this.reqUri = reqUri;
    this.reqOptions = reqOptions;
    this.respHeaders = fetchRes ? fetchRes.headers.raw() : undefined;
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
    this.code = jsonRpcErrorObject.code;
    this.data = tryStringify(jsonRpcErrorObject.data);
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
    return JSON.stringify(data);
  } catch (e) {
    return data;
  }
}

module.exports.RpcError = RpcError;
module.exports.RpcClientError = RpcClientError;
module.exports.RpcRequestError = RpcRequestError;