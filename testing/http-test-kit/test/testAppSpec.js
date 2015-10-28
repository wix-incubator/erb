var request = require('request'),
    expect = require('chai').expect,
    server = require('../index').testApp();

var port = 3333;
var baseUrl = 'http://localhost:' + port;

var app = server.getApp();

app.get('/foo', function (req, res) {
    res.send('bar');
});


describe("test app", function () {

    server.beforeAndAfterEach();
    
    it("http request", function (done) {
        request.get(baseUrl + '/foo', function (error, response, body) {
            expect(body).to.equal('bar');
            done();
        });
    });

});

