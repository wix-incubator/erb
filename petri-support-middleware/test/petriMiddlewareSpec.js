var request = require('request'),
    expect = require('chai').expect,
    server = require('http-test-kit').testApp(),
    _ = require('lodash'),
    cookiesUtils = require('cookies-utils')();

var Chance = require('chance');
var chance = new Chance();

server.getApp().use(require('wix-node-domain').wixDomainMiddleware());
server.getApp().use(require('../index').middleware());

server.getApp().get('/petriMiddlware', function (req, res) {
    var domain = require('wix-node-domain').wixDomain();
    res.send(domain.petriCookies);
});

var port = 3333;
var base_url = "http://localhost:" + port;



var addCookie = function (cookies, name, value) {
    cookies[name] = value;
};

var options = function () {
    return{
        uri: base_url + "/petriMiddlware",
        method: 'GET'        
    };
};

describe("petri middleware", function () {

    var userId = chance.guid();
    var cookies = {};
    addCookie(cookies, '_wixAB3', 'v1');
    addCookie(cookies, '_wixAB3' + userId, 'v2');
    addCookie(cookies, 'non-related-cookie', 'v3');
    
    server.beforeAndAfter();

    it("send request with petri cookies and they should returned after take them from the domain", function (done) {
        var ops = options();
        ops.headers = {Cookie: cookiesUtils.toHeader(cookies)};

        request.get(ops, function (error, response, body) {
            delete cookies['non-related-cookie'];
            expect(JSON.parse(body)).to.deep.equal(cookies);
            done();
        });
    });
    it("no petri cookies", function (done) {
        request.get(options(), function (error, response, body) {
            expect(JSON.parse(body)).to.deep.equal({});
            done();
        });

    });

});