var chai = require('chai'),
    expect = chai.expect;
    cookiesUtils = require('../index')();




describe("cookie", function(){
   
   
    
    it("ser and deser", function(){
        var cookieHeader = 'foo=bar; cat=meow; dog=ruff';
        var cookies = cookiesUtils.toDomain(cookieHeader);
        expect(cookiesUtils.toHeader(cookies)).to.equal(cookieHeader);
    });
    it("toDomain non exist cookie should return empty object", function(){
        var cookieHeader;
        expect(cookiesUtils.toDomain(cookieHeader)).to.deep.equal({});
    });
    
});