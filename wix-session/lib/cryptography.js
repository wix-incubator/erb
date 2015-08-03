var crypto = require('crypto');

exports.encrypt = function(data, options) {
    var iv = "";
    var clearEncoding = 'utf8';
    var cipherEncoding = 'hex';
    var cipherChunks = [];
    var cipher = crypto.createCipheriv('aes-128-ecb', options.mainKey, iv);
    cipher.setAutoPadding(true);

    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));

    return cipherChunks.join('');
};

exports.decrypt = function(data, options){
    var iv = "";
    var clearEncoding = 'utf8';
    var cipherEncoding = 'hex';
    var cipherChunks = [];
    var decipher = crypto.createDecipheriv('aes-128-ecb', options.mainKey, iv);
    decipher.setAutoPadding(true);

    cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));

    return cipherChunks.join('');

};