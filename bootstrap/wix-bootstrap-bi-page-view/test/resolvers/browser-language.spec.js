const expect = require('chai').expect,
  resolve = require('../../lib/resolvers/browser-language');

describe('browser-language resolver', () => {
  
  it('resolves simple language code', () => {
    expect(resolve('it')).to.equal('it');
  });
  
  it('resolves language code with variation', () => {
    expect(resolve('it-RU')).to.equal('it');
  });
  
  it('resolves language code with qualifier', () => {
    expect(resolve('it;q=0.9')).to.equal('it');
  });
  
  it('takes first language', () => {
    expect(resolve('it;q=0.9, ru')).to.equal('it');
  });
  
  it('handles wildcard', () => {
    expect(resolve('*;q=0.9')).to.equal('*');
  });
  
  it('returns empty string for empty string', () => {
    expect(resolve('')).to.equal('');
  });

  it('returns empty string for undefined', () => {
    expect(resolve(undefined)).to.equal('');
  });
});
