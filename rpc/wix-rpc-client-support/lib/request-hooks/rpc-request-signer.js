const wixHmacSigner = require('wix-hmac-signer');

module.exports.get = key => {
  const signer = wixHmacSigner.get(key);

  return (headers, jsonRequest) => {
    const now = Date.now().toString();
    const signature = signer.sign([new Buffer(jsonRequest).slice(0, 1024), now]);
    headers['X-Wix-Signature'] = signature + ';' + now;
    return headers;
  };
};
