var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
require('chai').use(chaiAsPromised);
chai.should();
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

    beforeEach(function () {
        driver.startServer();
    });

    afterEach(function () {
        tryAble(driver.stopServer);
    });


    it("send and get response from rpc client", function () {
        return driver.rpcClientFor('/SomePath')('add', 2, 2).should.eventually.equal(4);
    });
    it("send and get response from rpc client for function with no parameters", function () {
        return driver.rpcClientFor('/SomePath')('foo').should.eventually.equal('bar');
    });
    it("send request to not exists function", function() {
        return driver.rpcClientFor('/SomePath')('notExistsFunction').should.be.rejected;
    });

    it("invalid key", function () {
        return driver.rpcClientFor('/SomePath', {key: 'some-invalid-key'})('add', 2, 2).should.be.rejected;
    });
    it("server is down, catch the promise", function () {
        driver.stopServer();
        return driver.rpcClientFor('/SomePath')('add', 2, 2).should.be.rejected;
    });
});

