var chai = require('chai');
var expect = chai.expect;
var Chance = require('chance');
var chance = new Chance();
var Promise = require('bluebird');
var server = require('./testApp');
var defaults = require('./defaults')();


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


    it("send and get response from rpc client", function (done) {
        var someClient = rpcFactory.rpcClient(base_url + '/SomePath', {key: defaults.key});
        var response = someClient.invoke('add', [2,2]);
        response.then(function(result) {
            expect(result).to.equal(4);
            done();
        });
    });

    it("invalid key", function (done) {
        var someClient = rpcFactory.rpcClient(base_url + '/SomePath', {key: 'dddddd'});
        var response = someClient.invoke('add', [2,2]);
        response.catch(function(result) {
            expect(result.message).to.equal('invalid token');
            done();
        });
    });
});

