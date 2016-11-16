const rpcClient = require('..'),
  expect = require('chai').expect;

describe('json rpc client factory', () => {

  it('uses default timeout of 2s', () => {
    expect(rpcClient.factory().timeout).to.equal(2000);
  });

  it('uses custom timeout given it is provided via options', () => {
    expect(rpcClient.factory({timeout: 200}).timeout).to.equal(200);
  });

  it('validates for provided timeout would be int', () => {
    expect(() => rpcClient.factory({timeout: '200'})).to.throw('must be integer');
  });

});
