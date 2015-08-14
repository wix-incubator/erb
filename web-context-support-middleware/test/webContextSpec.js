var Chance = require('chance'),
    chance = new Chance(),
    request = require('request'),
    expect = require('chai').expect,
    server = require('./testApp'),
    matchers = require('./matchers')(require('chai'));

describe("web context", function () {

    var port = 3000;
    var base_url = 'http://localhost:' + port;

    before(function () {
        server.listen(port);
    });

    after(function () {
        server.close();
    });


    describe("request id", function () {
        
        it("server generates request id", function(done){
            request.get(base_url, function(error, res, body){
                expect(body).to.beValidGuid();
                done();
            });            
        });
        it("send request id as header", function(done){
            var requestId = chance.guid();
            var options = {
                uri: base_url,
                method: 'GET',
                headers: {
                    'X-Wix-Request-Id': requestId
                }
            };
            request.get(options, function(error, res, body){
                expect(body).to.equal(requestId);
                done();
            });
        });
        it("send request id as parameter", function(done){
            var requestId = chance.guid();
            request.get(base_url + '?request_id=' + requestId, function(error, res, body){
                expect(body).to.equal(requestId);
                done();
            });
        });

    });

});
    
    