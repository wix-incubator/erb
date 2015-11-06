'use strict';
const wixHmacSigner = require('wix-hmac-signer');

module.exports.get = (key) => {
  const signer = wixHmacSigner.get(key);

  return (headers, jsonRequest) => {
    const request = JSON.stringify(jsonRequest);
    const now = new Date().toString();
    const signature = signer.sign([new Buffer(request).slice(0, 1024), now]);
    headers['X-Wix-Signature'] = signature + ';' + now;
    return headers;
  };
};