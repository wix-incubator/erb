var Chance = require('chance'),
    chance = new Chance();

exports.getOrCreateRequestId = function(req){
    var idFromHeader = req.headers['x-wix-request-id'];
    var idFromParam = req.query['request_id'];
    if(idFromHeader)
        return idFromHeader;
    else if(idFromParam)
        return idFromParam;
    else
        return chance.guid();
};