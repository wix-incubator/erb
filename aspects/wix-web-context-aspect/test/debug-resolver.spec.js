const expect = require('chai').expect,
  resolve = require('../lib/resolvers/debug').resolve;

describe('debug resolver', () => {
  
  it('should resolve {debug: true} as true', () => {
    expect(resolve({'debug': 'true'})).to.equal(true);
  });

  it('should resolve {debug: ""} as true', () => {
    expect(resolve({'debug': ''})).to.equal(true);
  });

  it('should resolve {} as false', () => {
    expect(resolve({})).to.equal(false);
  });
});
