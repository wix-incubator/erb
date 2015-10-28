'use strict';

module.exports = function (chai) {

  chai.use(function (_chai, utils) {
    _chai.Assertion.addMethod('beValidRpcRequest', function (id, method, params) {
      var object = utils.flag(this, 'object');
      var rpcObject = JSON.parse(object);
      new _chai.Assertion(rpcObject.jsonrpc).to.be.eql('2.0');
      new _chai.Assertion(rpcObject.id).to.be.eql(id);
      new _chai.Assertion(rpcObject.method).to.be.eql(method);
      new _chai.Assertion(rpcObject.params).to.be.eql(params);
    });

    _chai.Assertion.addMethod('haveSignature', function (sig, time) {
      var object = utils.flag(this, 'object');
      this.assert(
        object['X-Wix-Signature'] === sig + ';' + time,
        'expected #{this} to have signature header',
        'expected #{this} to not have signature header'
      );
    });
  });

};

