'use strict';
const crypto = require('crypto');

const clearEncoding = 'utf8';
const cipherEncoding = 'hex';

exports.encrypt = (data, options) => {
  const cipherChunks = [];
  const cipher = ciphery(crypto.createCipheriv, options.mainKey);
  cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
  cipherChunks.push(cipher.final(cipherEncoding));

  return cipherChunks.join('');
};

exports.decrypt = (data, options) => {
  try {
    return decryptWithKey(data, options.mainKey);
  } catch (e) {
    if (options.alternateKey) {
      return decryptWithKey(data, options.alternateKey);
    } else {
      throw e;
    }
  }
};

function decryptWithKey(data, key) {
  const cipherChunks = [];
  const decipher = ciphery(crypto.createDecipheriv, key);
  cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
  cipherChunks.push(decipher.final(clearEncoding));

  return cipherChunks.join('');
}

function ciphery(cryptoFn, key) {
  const cipher = cryptoFn.apply(crypto, ['aes-128-ecb', key, '']);
  cipher.setAutoPadding(true);
  return cipher;
}