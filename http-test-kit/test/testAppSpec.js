var request = require('request'),
    expect = require('chai').expect,
    server = require('../index').testApp();

var port = 3333;
var baseUrl = 'http://localhost:' + port;

var app = server.app();
var someMiddleware = function(){
    return function(req, res, next){
        req.message = 'hi';
        next();
    };
};
server.middlewares([someMiddleware()]);

app.get('/foo', function (req, res) {
    res.send(req.message);
});


describe("test app", function () {

    before(function () {
        server.listen(port);
    });

    after(function () {
        server.close();
    });

    it("http request", function (done) {
        request.get(baseUrl + '/foo', function (error, response, body) {
            expect(body).to.equal('hi');
            done();
        });
    });

});

