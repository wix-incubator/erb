var request = require('request'),
    expect = require('chai').expect,
    domainHelper = require('../index');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
server.getApp().use(domainHelper.wixDomainMiddleware());
server.getApp().get('/domainName', function (req, res) {
    res.send(domainHelper.wixDomain().name);
});



describe("domain", function () {

    server.beforeAndAfter();
    
    it("node domain", function (done) {
        request.get('http://localhost:' + port + '/domainName', function (error, response, body) {
            expect(body).to.equal('wix-domain');
            done();
        });
    });

});





