var chai = require('chai');
var expect = chai.expect;
var Chance = require('chance');
var chance = new Chance();
var Promise = require('bluebird');
var server = require('./testApp');


var rpcFactory = require('../index');


describe("rpc client", function () {

    this.timeout(100);
    var port = 3000;
    var base_url = 'http://localhost:' + port;

    before(function () {
        server.listen(port);
    });

    after(function () {
        server.close();
    });

    var someClient = rpcFactory.rpcClient(base_url + '/SomePath', {});

    it("send and get response from rpc client", function (done) {        
        var response = someClient.invoke('add', [2,2]);
        response.then(function(result) {
            expect(result).to.equal(4);
            done();
        });
    });

    it("validate that signature is sent", function (done) {
        var response = someClient.invoke('validateSignature');
        response.then(function(result) {
            expect(result).have.length.above(10);
            done();
        });
    });
});

