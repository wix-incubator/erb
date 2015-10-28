'use strict';
module.exports = function (signer, now) {
  return new RequestSigner(signer, now);
};

function RequestSigner(signer, now) {
  this.signer = signer;
  this.now = now;
}

RequestSigner.prototype.sign = function (jsonRequest, headers) {
  var time = this.now().toString();
  var signature = this.signer.sign([new Buffer(jsonRequest).slice(0, 1024), time]);
  headers['X-Wix-Signature'] = signature + ';' + time;
  return headers;
};

