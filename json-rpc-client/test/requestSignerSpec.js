var chai = require('chai');
var expect = chai.expect;
var signer = require('../lib/signer');
var Chance = require('chance');
var chance = new Chance();

var requestSigner  = require('../lib/requestSigner');
var _ = require('lodash');
var key = "1234567890123456";

describe("request signer", function () {
    it("sign request", function () {
        var requestBuffer = randomBuffer(100);
        var timeInMillis = timeInMillisAsString();
        var signature = signer.sign([requestBuffer, timeInMillis], key);
        expect(requestSigner.sign(requestBuffer, timeInMillis, key)).to.satisfy(function(headerInfo){
            var o = {headerName: 'X-Wix-Signature', headerValue: signature + ";" +  timeInMillis};
            return _.isEqual(o, headerInfo);
        });
    });
    it("sign request which is longer then 1k, the signature should take only first K", function () {
        var requestBuffer = randomBuffer(2000);
        var timeInMillis = timeInMillisAsString();
        var signature = signer.sign([requestBuffer.slice(0, 1024), timeInMillis], key);
        expect(requestSigner.sign(requestBuffer, timeInMillis, key)).to.satisfy(function(headerInfo){
            var o = {headerName: 'X-Wix-Signature', headerValue: signature + ";" +  timeInMillis};
            return _.isEqual(o, headerInfo);
        });
    });
});


var randomBuffer = function(length){
    return new Buffer(JSON.stringify({name: chance.string({length: length})}));
};

var timeInMillisAsString = function(){
    return new Date().getTime().toString();
};

