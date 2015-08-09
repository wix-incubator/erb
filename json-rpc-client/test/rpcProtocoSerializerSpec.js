var chai = require('chai');
var expect = chai.expect;
require('./drivers/matchers')(chai);
var Chance = require('chance');
var chance = new Chance();



var rpcRequestIdGenerator = function(){
    return 1;
};
var serializer = require('../lib/rpcProtocolSerializer')(rpcRequestIdGenerator);


describe("rpc protocol serializer", function(){
   
    it("serialize object", function(){
        var method = chance.string();
        var params = [chance.string(), chance.integer()];
        expect(serializer.serialize(method, params)).to.beValidRpcRequest(1, method, params);
    });
    
});