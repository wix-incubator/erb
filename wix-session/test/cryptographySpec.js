var expect = require('chai').expect;
var crypto = require('../lib/cryptography')({'mainKey': '1234567890123456'});
var Chance = require('chance');

var chance = new Chance();



describe("cryptography", function () {
    it("encrypt and decrypt", function () {
        var key = chance.string({'length': 16});
        var data = chance.string();
        var encrypted = crypto.encrypt(data, key);
        expect(crypto.decrypt(encrypted, key)).to.equal(data);
    });
});
