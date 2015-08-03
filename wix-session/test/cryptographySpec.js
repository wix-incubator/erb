var expect = require('chai').expect;
var crypto = require('../lib/cryptography');
var Chance = require('chance');

var chance = new Chance();



describe("cryptography", function () {
    it("encrypt and decrypt", function () {
        var keys = {mainKey: chance.string({'length': 16})};
        var data = chance.string();
        var encrypted = crypto.encrypt(data, keys);
        expect(crypto.decrypt(encrypted, keys)).to.equal(data);
    });
});
