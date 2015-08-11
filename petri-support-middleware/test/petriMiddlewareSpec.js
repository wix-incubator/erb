var request = require('request'),
    expect = require('chai').expect,
    server = require('./testApp'),
    _ = require('lodash');

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


describe("petri middleware", function(){

    var userId = chance.guid();
    var cookies = {};
    var anonimousCookieName = '_wixAB3';
    var registeredCookieName = '_wixAB3|' + userId;
    cookies[anonimousCookieName] = chance.string();
    cookies[registeredCookieName] = chance.string();

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
                Cookie: toCookieString(cookies)
            }
        };
        request.get(options, function (error, response, body) {
            expect(JSON.parse(body)).to.deep.equal(cookies);
            done();
        });
    });
    
    
});