const crypto = require('crypto');

const AES_128_ECB = 'aes-128-ecb';
const defaultOptions = {
  clearEncoding: 'utf8',
  cipherEncoding: 'hex',
  algorithm: AES_128_ECB
};

exports.encrypt = (data, options) => {
  const opts = Object.assign({}, options, defaultOptions);
  return encryptWithKey(data, opts.mainKey, opts);
};

exports.decrypt = (data, options) => {
  const opts = Object.assign({}, options, defaultOptions);
  try {
    return decryptWithKey(data, opts.mainKey, opts);
  } catch (e) {
    if (options.alternateKey) {
      return decryptWithKey(data, opts.alternateKey, opts);
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
