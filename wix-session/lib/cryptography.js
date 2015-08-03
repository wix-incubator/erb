var crypto = require('crypto');

module.exports = function(options) {

    return {
        encrypt : function(data){
            var iv = "";
            var clearEncoding = 'utf8';
            var cipherEncoding = 'hex';
            var cipherChunks = [];
            var cipher = crypto.createCipheriv('aes-128-ecb', options.mainKey, iv);
            cipher.setAutoPadding(true);

            cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
            cipherChunks.push(cipher.final(cipherEncoding));

            return cipherChunks.join('');
        },

        decrypt : function(data){
            var iv = "";
            var clearEncoding = 'utf8';
            var cipherEncoding = 'hex';
            var cipherChunks = [];
            var decipher = crypto.createDecipheriv('aes-128-ecb', options.mainKey, iv);
            decipher.setAutoPadding(true);

            cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
            cipherChunks.push(decipher.final(clearEncoding));

            return cipherChunks.join('');

        }
    };

};