const expect = require('chai').expect,
  resolve = require('../lib/resolvers/url').resolve;

describe('url resolver', () => {

  it('should resolve url from header', () =>
    expect(resolve({'x-wix-forwarded-url': 'http://qwe.qwe/qwe'})).to.equal('http://qwe.qwe/qwe'));

  it('should fallback to explicit url', () =>
    expect(resolve({}, 'http://default')).to.equal('http://default'));
  
  it('should respect x-forwarded-proto', () => {
    expect(resolve({'x-forwarded-proto': 'https'}, 'http://default')).to.equal('https://default');
    
    expect(resolve({
      'x-wix-forwarded-url': 'http://qwe.qwe/qwe',
      'x-forwarded-proto': 'https'
    })).to.equal('https://qwe.qwe/qwe');
  });
});

