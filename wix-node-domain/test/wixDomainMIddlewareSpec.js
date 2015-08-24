var request = require('request'),
    expect = require('chai').expect,
  wixDomain = require('../index');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
var testApp = server.getApp();

testApp.use(wixDomain.wixDomainMiddleware());

testApp.get('/domainName', function (req, res) {
    res.send(wixDomain.wixDomain().name);
});

describe("Wix Domain middleware", function () {

    server.beforeAndAfter();

    it("should track a request with Wix domain", function (done) {
        request.get('http://localhost:' + port + '/domainName', function (error, response, body) {
            expect(body).to.equal('wix-domain');
            done();
        });
    });


});





