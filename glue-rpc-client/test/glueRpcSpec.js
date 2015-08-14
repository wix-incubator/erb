var chai = require('chai'),
    expect = chai.expect,
    Chance = require('chance'),
    chance = new Chance(),
    _ = require('lodash');


describe("glue rpc", function(){

    var rpcClient = function(){
        this.functions = [];
        this.registerHeaderBuildingHook = function(f){
            this.functions.push(f);
        };        
        
        this.req = {};
        
        var that = this;
        
        this.invoke = function(){
          this.functions.forEach(function(f){
            f(that.req);
          });              
        };
        
    };
        
    
    it("addSupport for rpc with petri cookies", function(){
        ctx = require('cookies-utils')().toDomain('c=1; e=2');
        var glue = require('../index')({petriContext: ctx});
        var rpc = new rpcClient();
        var s = glue.addSupportTo(rpc);
        rpc.invoke();
        expect(rpc.req.blabla).to.equal('xxx');
    });
    
});
