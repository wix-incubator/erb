'use strict';

module.exports = function(idGenerator){
    return {        
        serialize: function(method, params){
            var obj = {
                jsonrpc: '2.0',
                id: idGenerator(),
                method: method,
                params: params
            };
            return JSON.stringify(obj);
        }
    };
};