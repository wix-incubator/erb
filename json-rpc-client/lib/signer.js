var _ = require('lodash');

exports.signString = function(strings, key) {
    return sign(strings, key);
};

exports.signBuffer = function(buffers, key){
    return sign(buffers, key);
}


var sign = function(buffers, key) {
    var crypto = require('crypto')
    var bufferedKey = new Buffer(key, "utf8");
    var hmac = crypto.createHmac('sha1', bufferedKey);
    if(_.isArray(buffers)){
        _.forEach(buffers, function(n){
            hmac.update(n);
        });            
    } else {
        hmac.update(buffers);
    }
    

    return hmac.digest('hex');
};