var crypto = require('./lib/cryptography');

var delimiter = "###";


/**
 * *
 * @param {object} options contains mainKey and alternateKey
 * @returns {{fromStringToken: fromStringToken}}
 */
module.exports = function (options) {

    var sessionTemplate = {
        uid: 0,
        userGuid: 1,
        userName: 2,
        email: 3,
        mailStatus: 4,
        isWixStaff: 5,
        permissions: 6,
        userCreationDate: 7,
        version: 8,
        userAgent: 9,
        isRemembered: 10,
        expiration: 11,
        colors: {}
    };

    function decorateSessionValue (key, value) {
        var retVal = null;
        switch(key) {
            case 'uid':
            case 'version':
                retVal = parseInt(value, 10);
                break;
            case 'isWixStaff':
            case 'isRemembered':
                retVal = value === 'true';
                break;
            case 'userCreationDate':
            case 'expiration':
                retVal = new Date(parseFloat(value));
                break;
            case 'colors':
                retVal = {};
                break;
            default:
                retVal = value;
        }
        return retVal;
    }

    return {
        fromStringToken: function (token) {
            try {
                var tokenData = crypto.decrypt(token, options);
                var elements = tokenData.split(delimiter);
                var wixSession = {};
                Object.keys(sessionTemplate).map(function (key) {
                    var index = sessionTemplate[key];
                    Object.defineProperty(wixSession, key, {
                        value: decorateSessionValue(key, elements[index]),
                        enumerable: true
                    });
                });
                return wixSession;
            } catch (e) {
                return {
                    isError: true,
                    cause: "invalidToken"
                }
            }
        },
        sessionToToken : function(session){
            var tokenValues = [];
            Object.keys(sessionTemplate).map(function (key) {
                var value = session[key];
                if(value instanceof Date) {
                    value = value.getTime();
                }
                tokenValues.push(value);
            });
            tokenValues[tokenValues.length-1] = JSON.stringify(session.colors);
            return crypto.encrypt(tokenValues.join(delimiter), options);
        }
    }
};

