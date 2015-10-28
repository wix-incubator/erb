'use strict';
var crypto = require('crypto');

exports.encrypt = function (data, options) {
  var iv = '';
  var clearEncoding = 'utf8';
  var cipherEncoding = 'hex';
  var cipherChunks = [];
  var cipher = crypto.createCipheriv('aes-128-ecb', options.mainKey, iv);
  cipher.setAutoPadding(true);

  cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
  cipherChunks.push(cipher.final(cipherEncoding));

  return cipherChunks.join('');
};

exports.decrypt = function (data, options) {
  return decryptWithRetry(data, options, 1);
};

var decryptWithRetry = function (data, options, retry) {
  var cipherChunks = [];
  try {
    var key = '';
    switch (retry) {
      case 1:
        key = options.mainKey;
        break;
      case 2:
        key = options.alternateKey;
        break;
      default:
        return {isError: true};
    }
    var iv = '';
    var clearEncoding = 'utf8';
    var cipherEncoding = 'hex';
    var decipher = crypto.createDecipheriv('aes-128-ecb', key, iv);
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));

  } catch (e) {
    return decryptWithRetry(data, options, retry + 1);
  }
  return cipherChunks.join('');
};