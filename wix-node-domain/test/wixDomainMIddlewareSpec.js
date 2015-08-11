var request = require('request'),
    expect = require('chai').expect,
    server = require('./testApp');

var port = 3030;



describe("domain", function () {

    before(function () {
        server.listen(port);
    });

    after(function () {
        server.close();
    });
    
    it("node domain", function (done) {
        request.get('http://localhost:' + port + '/domainName', function (error, response, body) {
            expect(body).to.equal('wix-domain');
            done();
        });
    });

});





