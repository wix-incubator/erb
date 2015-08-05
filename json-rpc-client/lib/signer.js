
exports.signString = function(str) {
    return sign(new Buffer(str));
};

exports.signBuffer = function(buffer){
    return sign(buffer);
}


var sign = function(buffer) {
    var crypto = require('crypto')
    var key = new Buffer("1234567890123456", "utf8");
    return crypto.createHmac('sha1', key).update(buffer).digest('hex');
};