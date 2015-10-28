var uuidGenerator = require('uuid-support');
var _ = require('lodash');

exports.getOrCreateRequestId = function (req) {
    return  _.reduce([idFromHeader, idFromParam, newId], function(res, f){
        return res || f(req)
    }, false);
};

var idFromHeader = function (req) {
    return req.headers['x-wix-request-id'];
};

var idFromParam = function (req) {
    return req.query['request_id'];
};

var newId = function(){
    return uuidGenerator.generate();
};