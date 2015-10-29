'use strict';
var expect = require('chai').expect;
var rpcTestKit = require('wix-rpc-client-testkit');

describe('rpc client support', function () {


  beforeEach(function () {
    var signer = {
      sign: function () {
        return 'sig';
      }
    };
    this.rpcSupport = require('../wix-rpc-client-support')(signer);
  });

  var RpcFactoryStub = rpcTestKit.rpcStub;

  //TODO: fixme
  it.skip('register headers hook with values', function () {
    var rpc = new RpcFactoryStub();
    this.rpcSupport.addSupportToRpcClients(rpc);
    rpc.invoke();
    expect(rpc.headers).to.have.property('X-Wix-Signature');
  });
});
