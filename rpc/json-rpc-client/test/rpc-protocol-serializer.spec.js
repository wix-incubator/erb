'use strict';
var chai = require('chai');
var expect = chai.expect;
require('./drivers/matchers')(chai);
var Chance = require('chance');
var chance = new Chance();

var rpcRequestIdGeneratorStub = function () {
  return 1;
};
var serializer = require('../lib/rpcProtocolSerializer')(rpcRequestIdGeneratorStub);

describe('rpc protocol serializer', function () {

  it('serialize object', function () {
    var method = chance.string();
    var params = [chance.string(), chance.integer()];
    expect(serializer.serialize(method, params)).to.beValidRpcRequest(1, method, params);
  });
  it('serialize object with empty params', function () {
    var method = chance.string();
    expect(serializer.serialize(method)).to.beValidRpcRequest(1, method);
  });
});