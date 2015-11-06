'use strict';
const wixHmacSigner = require('wix-hmac-signer');

module.exports.get = (key) => {
  const signer = wixHmacSigner.get(key);

  return (jsonRequest, headers) => {
    const time = new Date().toString();
    const signature = signer.sign([new Buffer(jsonRequest).slice(0, 1024), time]);
    headers['X-Wix-Signature'] = signature + ';' + time;
    return headers;
  };
};