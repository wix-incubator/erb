'use strict';

module.exports = (idGenerator) => {
  return (method, params) => {
    return JSON.stringify({
      jsonrpc: '2.0',
      id: idGenerator(),
      method: method,
      params: params
    });
  };
};