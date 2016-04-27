'use strict';
module.exports = chai => {
  chai.Assertion.addMethod('validRpcRequest', validRpcRequest);

  function validRpcRequest(id, method, params) {
    var rpcObject = JSON.parse(this._obj);
    new chai.Assertion(rpcObject.jsonrpc).to.be.eql('2.0');
    new chai.Assertion(rpcObject.id).to.be.eql(id);
    new chai.Assertion(rpcObject.method).to.be.eql(method);
    new chai.Assertion(rpcObject.params).to.be.eql(params);
  }
};

