const expect = require('chai').use(require('./support/matchers')).expect,
  serializer = require('../lib/serializer');

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
