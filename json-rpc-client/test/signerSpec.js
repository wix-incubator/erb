var chai = require('chai');
var expect = chai.expect;
var signer = require('../lib/signer');

var key = "1234567890123456";
var text = "hi, I am going to be signed";

describe("signer", function () {
    it("sign string with HmacSHA1", function () {
        expect(signer.signString(text, key)).to.equal("e9fe8a2f598bf3831bff2a62abbdbe200edcc7bb");
    });
    it("sign buffer with HmacSHA1", function () {
        expect(signer.signBuffer(new Buffer(text), key)).to.equal("e9fe8a2f598bf3831bff2a62abbdbe200edcc7bb");
    });
});
