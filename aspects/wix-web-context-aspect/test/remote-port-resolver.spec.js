const expect = require('chai').expect,
  resolve = require('../lib/resolvers/remote-port').resolve;

describe('remote port resolver', () => {

  it('should return user ip from wix header', () =>
    expect(resolve({'x-wix-default_port': 3333})).to.be.equal(3333));

  it('should return user ip from remote port on request', () =>
    expect(resolve({}, 2212)).to.be.equal(2212));
});
