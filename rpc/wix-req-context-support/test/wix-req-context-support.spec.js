'use strict';
var request = require('request');
var expect = require('chai').expect;
var mockery = require('mockery');
var rpcTestKit = require('wix-rpc-client-testkit');

describe('web context support', function () {

  describe('support rpc client', function () {

    before(function () {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    after(function () {
      mockery.disable();
    });

    beforeEach(function () {
      var self = this;
      this.requestId = 'some-request-id';
      this.localUrl = 'some-url';
      this.userIp = '1.1.1.99';
      this.userPort = 7777;
      this.userAgent = 'chrome';

      function ReqContex() {
      }

      this.stub = new ReqContex();
      ReqContex.prototype.reqContext = function () {
        return {
          requestId: self.requestId,
          localUrl: self.localUrl,
          userIp: self.userIp,
          userPort: self.userPort,
          userAgent: self.userAgent
        };
      };
      mockery.registerMock('wix-req-context', this.stub);
      this.webContextSupport = require('../').rpcSupport();
    });

    var RpcFactoryStub = rpcTestKit.rpcStub;

    it('register headers hook with values', function () {
      var rpc = new RpcFactoryStub();
      this.webContextSupport.addSupportToRpcClients(rpc);
      rpc.invoke();
      expect(rpc.headers).to.have.property('X-Wix-Request-Id', this.requestId);
      expect(rpc.headers).to.have.property('X-WIX-URL', this.localUrl);
      expect(rpc.headers).to.have.property('X-WIX-IP', this.userIp);
      expect(rpc.headers).to.have.property('X-WIX-DEFAULT_PORT', this.userPort);
      expect(rpc.headers).to.have.property('user-agent', this.userAgent);
      // TODO check geo
    });
  });

});