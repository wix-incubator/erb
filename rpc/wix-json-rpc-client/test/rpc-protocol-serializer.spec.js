'use strict';
const chai = require('chai'),
  expect = chai.expect,
  serializer = require('../lib/serializer');

chai.use(require('./support/matchers'));

describe('rpc protocol serializer', () => {
  const serialize = serializer.get(() => 1);

  it('should serialize object', () => {
    const method = 'methodName';
    const params = ['param1', 1];
    expect(serialize(method, params)).to.be.validRpcRequest(1, method, params);
  });

  it('should serialize object with empty params', () => {
    const method = 'methodName';
    expect(serialize(method)).to.be.validRpcRequest(1, method);
  });
});