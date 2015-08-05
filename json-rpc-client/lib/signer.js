var _ = require('lodash');
var crypto = require('crypto');

exports.sign = function(strings, key) {
    return sign(strings, key);
};


var sign = function(buffers, key) {
    
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