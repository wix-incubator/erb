/**
 * Created by algirdasb on 16/11/15.
 */
'use strict';
const crypto = require('crypto');

const clearEncoding = 'utf8';
const cipherEncoding = 'hex';
const AES_128_ECB = 'aes-128-ecb';

exports.encrypt = (data, options) => {
  const cipherChunks = [];
  const cipher = ciphery(crypto.createCipheriv, options.mainKey, options.algorithm);
  cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
  cipherChunks.push(cipher.final(cipherEncoding));

  return cipherChunks.join('');
};

exports.decrypt = (data, options) => {
  try {
    return decryptWithKey(data, options.mainKey, options.algorithm);
  } catch (e) {
    if (options.alternateKey) {
      return decryptWithKey(data, options.alternateKey, options.algorithm);
    } else {
      throw e;
    }
  }
};

exports.AES_128_ECB = AES_128_ECB;

function decryptWithKey(data, key, algorithm) {
  const cipherChunks = [];
  const decipher = ciphery(crypto.createDecipheriv, key, algorithm);
  cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
  cipherChunks.push(decipher.final(clearEncoding));

  return cipherChunks.join('');
}

function ciphery(cryptoFn, key, algorithm) {
  algorithm = algorithm || AES_128_ECB;
  const cipher = cryptoFn.apply(crypto, [algorithm, key, '']);
  cipher.setAutoPadding(true);
  return cipher;
}