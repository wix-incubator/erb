var crypto = require('../lib/cryptography');
var Chance = require('chance');
var chai = require('chai');
var expect = chai.expect;
var chance = new Chance();
require('./matchers')(chai);



describe("cryptography", function () {

    // todo move context to before

    it("encrypt and decrypt", function () {
        var ctx = context(1);
        var encrypted = crypto.encrypt(ctx.data, ctx.keys);
        expect(crypto.decrypt(encrypted, ctx.keys)).to.equal(ctx.data);
    });
    it("encrypt with alternate key and decrypt with keys (key and alternate key)", function () {
        var ctx = context(2);
        var encrypted = crypto.encrypt(ctx.data, {mainKey: ctx.keys.alternateKey});
        expect(crypto.decrypt(encrypted, ctx.keys)).to.equal(ctx.data);
    });
    it("encrypt and decrypt with invalid key", function () {
        var ctx = context(1);
        var someOtherKeys = {mainKey: chance.string({'length': 16})};
        var encrypted = crypto.encrypt(ctx.data, ctx.keys);
        expect(crypto.decrypt(encrypted, someOtherKeys)).to.beError();
    });

});




var context = function (keysCount) {

    var randomKey = function(){return chance.string({'length': 16});};
    var keysGeneration = function () {
        return (keysCount === 1) ? {mainKey: randomKey()} :
                                  {mainKey: randomKey(), alternateKey: randomKey()};
    };
    return {
        keys:  keysGeneration(),
        data: chance.string()
    };
};