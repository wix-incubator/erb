
exports.signString = function(str, key) {
    return sign(new Buffer(str), key);
};

exports.signBuffer = function(buffer, key){
    return sign(buffer, key);
}


var sign = function(buffer, key) {
    var crypto = require('crypto')
    var key = new Buffer(key, "utf8");
    return crypto.createHmac('sha1', key).update(buffer).digest('hex');
};