var chai = require('chai'),
    expect = chai.expect,
    Chance = require('chance'),
    chance = new Chance(),
    _ = require('lodash');


describe("glue rpc", function(){
   // TODO - try sinon npm as STUB
    var rpcClient = function(){
        this.functions = [];
        this.registerHeaderBuildingHook = function(f){
            this.functions.push(f);
        };        
        
        this.headers = {};
        
        var self = this;
        
        this.invoke = function(){
          this.functions.forEach(function(f){
            f(self.headers);
          });              
        };
        
    };
        
    
    it("addSupport for rpc with petri cookies", function(){
        var glue = require('../index')({webContext: { requestId: '1234567890' }});
        var rpc = new rpcClient();
        var s = glue.addSupportTo(rpc);
        rpc.invoke();
        expect(rpc.headers['x-wix-request-id']).to.equal('1234567890');
    });
    
});
