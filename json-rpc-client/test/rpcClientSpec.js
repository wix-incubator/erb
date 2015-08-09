var chai = require('chai');
var expect = chai.expect;
var Chance = require('chance');
var chance = new Chance();
var Promise = require('bluebird');
var defaults = require('./defaults')();
var driver = require('./drivers/rpcDriver');

var tryAble = function (f) {
    try {
        f();
    } catch (e) {
        //do nothing
    }
};

describe("rpc client", function () {

    this.timeout(100);

    beforeEach(function () {
        driver.startServer();
    });

    afterEach(function () {
        tryAble(driver.stopServer);
    });


    it("send and get response from rpc client", function (done) {
        driver.rpcClientFor('/SomePath')('add', 2, 2)
            .then(function (result) {
                expect(result).to.equal(4);
                done();
            });
    });
    it("send and get response from rpc client for function with no parameters", function (done) {
        driver.rpcClientFor('/SomePath')('foo')
            .then(function (result) {
                expect(result).to.equal('bar');
                done();
            });
    });
    it("send request to not exists function", function (done) {
        driver.rpcClientFor('/SomePath')('notExistsFunction')
            .catch(function (e) {
                expect(e.message).to.equal("Method not found");
                done();
            });
    });

    it("invalid key", function (done) {
        driver.rpcClientFor('/SomePath', {key: 'some-invalid-key'})('add', 2, 2)
            .catch(function (result) {
                expect(result.message).to.equal('invalid token');
                done();
            });
    });
    it("server is down, catch the promise", function (done) {
        driver.stopServer();
        driver.rpcClientFor('/SomePath')('add', 2, 2)
            .catch(function (result) {
                expect(result.message).to.equal('connect ECONNREFUSED');
                done();
            });
    });
});

