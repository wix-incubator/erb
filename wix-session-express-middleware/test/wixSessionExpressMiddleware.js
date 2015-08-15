var Chance = require('chance');
var chance = new Chance();

describe("server", function () {

    var port = 3333;
    
    var server = require('http-test-kit').testApp({port: port});
    var request = require('request');
    var expect = require('chai').expect;
    var builders = require('./builders');    
    var wixSession = require('wix-session')({mainKey: builders.key()});
    var wixSessionMiddleware = require('../index')({mainKey: builders.key()});
    var wixDomain = require('wix-node-domain');
    var cookiesUtils = require('cookies-utils')();

    server.getApp().use(wixDomain.wixDomainMiddleware());
    server.getApp().use('/requireLogin', wixSessionMiddleware.middleware());


    server.getApp().get('/requireLogin', function(req, res) {
        res.send(wixSessionMiddleware.session().userGuid);
    });

    server.getApp().get('/notRequireLogin', function(req, res) {
        res.send("no need to login");
    });


    var base_url = 'http://localhost:' + port;

    server.beforeAndAfterEach();


    


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
            var cookie = cookiesUtils.toHeader({wixSession: wixSession.sessionToToken(session)});
            var options = {
                uri: base_url + "/requireLogin",
                method: 'GET',
                headers: {}
            };
            var cookieHeaderName = 'cookie';
            options.headers[cookieHeaderName] = cookie;
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


    
