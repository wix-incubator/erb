var request = require('request');
var expect = require('chai').expect;
var server = require('./testApp');

var port = 3030;

before(function () {
    server.listen(port);
});

after(function () {
    server.close();
});

describe("domain", function () {

    it("node domain", function (done) {
        request.get('http://localhost:' + port + '/domainName', function (error, response, body) {
            expect(body).to.equal('wix-domain');
            done();
        });
    });

});





