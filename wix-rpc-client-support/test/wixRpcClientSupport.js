var expect = require('chai').expect;
var rpcTestKit = require('rpc-client-test-kit');

describe("rpc client support", function () {


  beforeEach(function () {
    var signer = {
      sign: function () {
        return 'sig';
      }
    };
    this.rpcSupport = require('../wix-rpc-client-support')(signer);
  });

  var rpcFactoryStub = rpcTestKit.rpcStub;

  it("register headers hook with values", function () {
    var rpc = new rpcFactoryStub();
    this.rpcSupport.addSupportToRpcClients(rpc);
    rpc.invoke();
    expect(rpc.headers).to.have.property('X-Wix-Signature');
  });
});
