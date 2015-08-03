var expect = require('chai').expect;
var crypto = require('../lib/cryptography');
var Chance = require('chance');

var chance = new Chance();


describe("cryptography", function () {
    it("encrypt and decrypt", function () {
        var ctx = context(1);
        var encrypted = crypto.encrypt(ctx.data, ctx.keys);
        expect(crypto.decrypt(encrypted, ctx.keys)).to.equal(ctx.data);
    });
    it("encrypt and decrypt with alternate key", function () {
        var ctx = context(2);
        var encrypted = crypto.encrypt(ctx.data, {mainKey: ctx.keys.alternateKey});
        expect(crypto.decrypt(encrypted, ctx.keys)).to.equal(ctx.data);
    });
    it("encrypt and decrypt with invalid key", function () {
        var ctx = context(1);
        var someOtherKeys = {mainKey: chance.string({'length': 16})};
        var encrypted = crypto.encrypt(ctx.data, ctx.keys);
        expect(crypto.decrypt(encrypted, someOtherKeys)).to.have.property('isError').to.equal(true);
    });

});

var context = function (keysCount) {

    var keysGeneration = function () {
        if (keysCount == 1) return {mainKey: chance.string({'length': 16})};
        else return {mainKey: chance.string({'length': 16}), alternateKey: chance.string({'length': 16})};
    };
    var random = function() {
       return chance.string();
    };
    return {
        keys: keysGeneration(),
        data: random()
    };
};