var uuidGenerator = require('uuid-support'),
    request = require('request'),
    expect = require('chai').expect,
    server = require('http-test-kit').testApp(),
    wixDomain = require('wix-express-domain'),
    reqContext = require('../wix-express-req-context');

require('./matchers')(require('chai'));
var app = server.getApp();
app.use(wixDomain.wixDomainMiddleware());
app.use(reqContext.reqContextMiddleware());


app.get('/', function(req, res) {
    res.send(reqContext.reqContext().requestId);
});


describe("web context", function () {

    var port = 3333;
    var base_url = 'http://localhost:' + port;

    server.beforeAndAfterEach();


    describe("request id", function () {

        var requestId = uuidGenerator.generate();
        var options = function() {
            return {
                uri: base_url,
                method: 'GET'
                
            };
        };
        
        it("server generates request id", function(done){
            request.get(options(), function(error, res, body){
                expect(body).to.beValidGuid();
                done();
            });            
        });
        it("send request id as header", function(done){
            var opt = options();
            opt.headers = {
                'X-Wix-Request-Id': requestId
            };
            request.get(opt, function(error, res, body){
                expect(body).to.equal(requestId);
                done();
            });
        });
        it("send request id as parameter", function(done){
            var opts  = options();
            opts.uri = base_url + '?request_id=' + requestId;
            request.get(opts, function(error, res, body){
                expect(body).to.equal(requestId);
                done();
            });
        });

    });

});
    
    