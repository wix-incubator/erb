'use strict';
const _ = require('lodash'),
  crypto = require('crypto');

module.exports.get = key => new HmacSigner(key);

class HmacSigner {
  constructor(key) {
    let bufferedKey = new Buffer(key, 'utf8');
    this.hmacSigner = () => crypto.createHmac('sha1', bufferedKey);
  }

  sign(data) {
    let toArray = buffers => _.isArray(buffers) ? buffers : [buffers];
    let signer = this.hmacSigner();

    toArray(data).forEach(buff => signer.update(buff));
    return signer.digest('hex');
  }
}