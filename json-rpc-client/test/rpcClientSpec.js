var chai = require('chai');
var expect = chai.expect;
var Chance = require('chance');
var chance = new Chance();
var Promise = require('bluebird');
var defaults = require('./defaults')();
var driver = require('./drivers/rpcDriver');


var rpcFactory = require('../index');


describe("rpc client", function () {

    this.timeout(100);

    beforeEach(function () {
        driver.startServer();
    });

    afterEach(function () {
        try{
            driver.stopServer();
        }catch(e){
            // Do nothing
        }
    });


    it("send and get response from rpc client", function (done) {
        var response = driver.rpcClientFor('/SomePath').invoke('add', [2,2]);
        response.then(function(result) {
            expect(result).to.equal(4);
            done();
        });
    });

    it("invalid key", function (done) {
        var response = driver.rpcClientFor('/SomePath', {key: 'dddddd'}).invoke('add', [2,2]);
        response.catch(function(result) {
            expect(result.message).to.equal('invalid token');
            done();
        });
    });
    it("server is down, catch the promise", function (done) {
        driver.stopServer();
        var response = driver.rpcClientFor('/SomePath').invoke('add', [2,2]);
        response.catch(function(result) {
            expect(result.message).to.equal('connect ECONNREFUSED');
            done();
        });
    });
});

