/**
 * Created by algirdasb on 16/11/15.
 */
'use strict';
const _ = require('lodash'),
  crypto = require('crypto');

const AES_128_ECB = 'aes-128-ecb';
const defaultOptions = {
  clearEncoding: 'utf8',
  cipherEncoding: 'hex',
  algorithm: AES_128_ECB
};

exports.encrypt = (data, options) => {
  options = _.defaults(options, defaultOptions);
  return encryptWithKey(data, options.mainKey, options);
};

exports.decrypt = (data, options) => {
  options = _.defaults(options, defaultOptions);
  try {
    return decryptWithKey(data, options.mainKey, options);
  } catch (e) {
    if (options.alternateKey) {
      return decryptWithKey(data, options.alternateKey, options);
    } else {
      throw e;
    }
  }
};

exports.AES_128_ECB = AES_128_ECB;

function encryptWithKey(data, key, options) {
  const cipherChunks = [];
  const cipher = ciphery(crypto.createCipheriv, key, options.algorithm);
  cipherChunks.push(cipher.update(data, options.clearEncoding, options.cipherEncoding));
  cipherChunks.push(cipher.final(options.cipherEncoding));

  return cipherChunks.join('');
}

function decryptWithKey(data, key, options) {
  const cipherChunks = [];
  const decipher = ciphery(crypto.createDecipheriv, key, options.algorithm);
  cipherChunks.push(decipher.update(data, options.cipherEncoding, options.clearEncoding));
  cipherChunks.push(decipher.final(options.clearEncoding));

  return cipherChunks.join('');
}

function ciphery(cryptoFn, key, algorithm) {
  algorithm = algorithm || AES_128_ECB;
  const cipher = cryptoFn.apply(crypto, [algorithm, key, '']);
  cipher.setAutoPadding(true);
  return cipher;
}