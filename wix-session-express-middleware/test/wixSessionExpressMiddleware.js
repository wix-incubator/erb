var Chance = require('chance');
var chance = new Chance();

describe("server", function () {

    var server = require('./testApp');
    var request = require('request');
    var expect = require('chai').expect;
    var builders = require('./builders');    
    var wixSession = require('wix-session')({mainKey: builders.key()});
    
    


    var port = 3000;
    var base_url = 'http://localhost:' + port;

    before(function () {
        server.listen(port);
    });

    after(function () {
        server.close();
    });


    describe("Session support middleware", function () {
        it("not require login should get 200", function (done) {
            request.get(base_url + "/notRequireLogin", function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
        it("require login without session should be rejected", function (done) {
            request.get(base_url + "/requireLogin", function (error, response, body) {
                expect(response.statusCode).to.equal(401);
                done();
            });
        });
        it("require login without should return user id", function (done) {
            var session = sessionBuilder();
            var cookieString = 'wixSession=' + wixSession.sessionToToken(session) + '; expires=' + new Date(new Date().getTime() + 86409000);
            var options = {
                uri: base_url + "/requireLogin",
                method: 'GET',
                headers: {
                    Cookie: cookieString
                }
            };
            request.get(options, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.equal(session.userGuid);
                done();
            });
        });
        
    });
});

var sessionBuilder = function(){
    return {
        uid: chance.integer(),
        permissions: randomString(),
        userGuid: chance.guid(),
        userName: randomString(),
        email: randomString() + "@somedomain.com",
        mailStatus: randomString(),
        userAgent: randomString(),
        isWixStaff: chance.bool(),
        isRemembered: chance.bool(),
        expiration: chance.date(),
        userCreationDate: chance.date(),
        version: 1,
        colors: {}
    };

};

var randomString = function(){
    return chance.string().replace("#", "");
};


    
