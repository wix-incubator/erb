var request = require('request');
var expect = require('chai').expect;
var mockery = require('mockery');



describe("web context support", function () {

  describe("support rpc client", function () {

    before(function () {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    after(function () {
      mockery.disable();
    });
    
    beforeEach(function(){
      var self = this;
      this.requestId = 'some-request-id'; 
        
      function ReqContex(){}
      this.stub = new ReqContex();
      ReqContex.prototype.reqContext = function(){
        return {
          requestId: self.requestId
        };
      };
      mockery.registerMock('wix-req-context', this.stub);
      this.webContextSupport = require('../web-req-context-support')();
    });

    var rpcFactoryStub = function () {
      var self = this;
      this.functions = [];
      this.registerHeaderBuildingHook = function (f) {
        this.functions.push(f);
      };
      
      this.headers = {};
      this.jsonBuffer = {};

      
      this.invoke = function(){
        this.functions.forEach(function(f){
          f(self.headers, self.jsonBuffer);
        });        
      };
    };
    it("register headers hook", function () {
      var rpc = new rpcFactoryStub();
      this.webContextSupport.addSupportToRpcClients(rpc);
      rpc.invoke();
      expect(rpc.headers).to.have.property('X-Wix-Request-Id', this.requestId);
    });

  });

});