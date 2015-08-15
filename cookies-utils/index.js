var cookie = require('cookie'),
    _ = require('lodash');

// TODO = check with more headers
module.exports = function(){
    return {
        toHeader: function(cookies){
            var ser = [];
            for(var key in cookies){
                ser.push(cookie.serialize(key, cookies[key]))
            }
            return ser.join('; ');
        },
        toDomain: function(header){
            if(header)
                return cookie.parse(header);
            else
                return {};

        }
    };
    
};