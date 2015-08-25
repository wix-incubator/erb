var request = require('request');
var expect = require('chai').expect;
var webContextSupport = require('../web-req-context-support')();

describe("web context support", function () {

  describe("support rpc client", function () {


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
      webContextSupport.addSupportToRpcClients(rpc);
      rpc.invoke();
      console.log(rpc.headers);
    });

  });

});