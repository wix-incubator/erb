const expect = require('chai').expect,
  resolve = require('../../lib/resolvers/referer');

describe('referrer resolver', () => {
  
  it('returns header value', () => {
    expect(resolve('http://some/url')).to.equal('http://some/url');
  });
  
  it('returns empty string for undefined', () => {
    expect(resolve(undefined)).to.equal('');
  });
});
