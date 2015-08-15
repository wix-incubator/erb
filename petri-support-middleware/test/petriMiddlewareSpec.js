var request = require('request'),
    expect = require('chai').expect,
    server = require('./testApp'),
    _ = require('lodash'),
    cookiesUtils = require('cookies-utils')();

var Chance = require('chance');
var chance = new Chance();

var toCookieString = function(cookies){
    var cookieString = "";
    for(var key in cookies){
        cookieString += key + '=' + cookies[key] + '; ';
    }
    // TODO - remove this hack
    return cookieString + "someOtherCookie=SomeValue; ";
    
};

var addCookie = function(cookies, name, value){
    cookies[name] = value;        
};

describe("petri middleware", function(){

    var userId = chance.guid();
    var cookies = {};
    
    addCookie(cookies, '_wixAB3', 'v1');
    addCookie(cookies, '_wixAB3' + userId, 'v2');
    addCookie(cookies, 'non-related-cookie', 'v3');

    
    var port = 3333;
    var base_url = "http://localhost:" + port;
    
    before(function () {
        server.listen(port);
    });

    after(function () {
        server.close();
    });

    it("send request with petri cookies and they should returned after take them from the domain", function (done) {

        var options = {
            uri: base_url + "/petriMiddlware",
            method: 'GET',
            headers: {
                Cookie: cookiesUtils.toHeader(cookies)
            }
        };
        request.get(options, function (error, response, body) {
            delete cookies['non-related-cookie'];
            expect(JSON.parse(body)).to.deep.equal(cookies);
            done();
        });
    });    
    
});