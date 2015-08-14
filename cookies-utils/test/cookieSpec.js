var chai = require('chai'),
    expect = chai.expect;
    cookiesUtils = require('../index')();




describe("cookie", function(){
   
   
    
    it("ser and deser", function(){
        var cookieHeader = 'foo=bar; cat=meow; dog=ruff';
        var cookies = cookiesUtils.toDomain(cookieHeader);
        expect(cookiesUtils.toHeader(cookies)).to.equal(cookieHeader);
    });
    
});