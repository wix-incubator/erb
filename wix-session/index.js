var crypto = require('./lib/cryptography');

var delimiter = "###";


/**
 * *
 * @param {object} options contains mainKey and alternateKey
 * @returns {{fromStringToken: fromStringToken}}
 */
module.exports = function (options) {

    return {
        fromStringToken: function (token) {
            try {
                var tokenData = crypto.decrypt(token, options);
                var elements = tokenData.split(delimiter);
                return {
                    userGuid: elements[1],
                    userName: elements[2],
                    email: elements[3]
                }
            } catch (e) {
                return {
                    isError: true,
                    cause: "invalidToken"
                }
            }
        }

    }

};