'use strict';
const wixReqContext = require('wix-req-context');

module.exports.get = () => {
  return (headers) => {
    const reqContext = wixReqContext.get();
    headers['X-Wix-Request-Id'] = reqContext.requestId;
    return headers;
  };
};