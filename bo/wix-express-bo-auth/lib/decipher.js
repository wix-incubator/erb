const crypto = require('wix-crypto');

module.exports = (token, encryptionKey) => {
  const decrypted = crypto.decrypt(token, {mainKey: encryptionKey, cipherEncoding: 'base64'});
  return JSON.parse(decrypted);
};

