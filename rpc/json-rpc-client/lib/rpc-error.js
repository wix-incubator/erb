'use strict';

class RpcError extends Error {
  constructor(uri, reqOptions, jsonRpcErrorObject) {
    super(jsonRpcErrorObject.message);
    this.name = this.constructor.name;
    this.code = jsonRpcErrorObject.code;
    this.reqUri = uri;
    this.reqOptions = tryStringify(reqOptions);
    this.data = tryStringify(jsonRpcErrorObject.data);
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

module.exports = RpcError;