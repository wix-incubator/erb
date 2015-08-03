var crypto = require('./lib/cryptography');

var delimiter = "###";


/**
 * *
 * @param options
 * @returns {{fromStringToken: fromStringToken}}
 */
module.exports = function (options) {

    var Crypto = crypto(options);
    return {
        fromStringToken: function (token) {
            try {
                var tokenData = Crypto.decrypt(token);
                var elementss = tokenData.split(delimiter);
                var session = function (elements) {
                    this.userGuid = elements[1];
                    this.userName = elements[2];
                    this.email = elements[3];
                };
                return new session(elementss);
            } catch (e) {
                return new Error("invalid token");
            }
        }

    }

}