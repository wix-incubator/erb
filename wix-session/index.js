var crypto = require('./lib/cryptography');

var delimiter = "###";


/**
 * *
 * @param {object} options contains mainKey and alternateKey
 * @returns {{fromStringToken: fromStringToken}}
 */
module.exports = function (options) {

    var isTrueSet = function(b) {
        return (b === 'true');
    };
    
    return {
        fromStringToken: function (token) {
            try {
                var tokenData = crypto.decrypt(token, options);
                var elements = tokenData.split(delimiter);
                return {
                    uid: parseInt(elements[0]),
                    userGuid: elements[1],
                    userName: elements[2],
                    email: elements[3],
                    mailStatus: elements[4],
                    isWixStaff: isTrueSet(elements[5]),
                    permissions: elements[6],
                    userCreationDate: new Date(parseFloat(elements[7])),
                    version: parseInt(elements[8]),
                    userAgent: elements[9],
                    isRemembered: isTrueSet(elements[10]),
                    expiration: new Date(parseFloat(elements[11])),
                    colors: {}
                }
            } catch (e) {
                return {
                    isError: true,
                    cause: "invalidToken"
                }
            }
        },
        sessionToToken : function(session){
            var stringSession = session.uid + delimiter;
            stringSession += session.userGuid + delimiter;
            stringSession += session.userName + delimiter;
            stringSession += session.email + delimiter;
            stringSession += session.mailStatus + delimiter;
            stringSession += session.isWixStaff + delimiter;
            stringSession += session.permissions + delimiter;
            stringSession += session.userCreationDate.getTime() + delimiter;
            stringSession += session.version + delimiter;
            stringSession += session.userAgent + delimiter;
            stringSession += session.isRemembered + delimiter;
            stringSession += session.expiration.getTime() + delimiter;
            stringSession += JSON.stringify(session.colors);
            return crypto.encrypt(stringSession, options)
        }
    }
};

