'use strict';
const expect = require('chai').expect,
  resolve = require('../lib/resolvers/language').resolve;

describe('language resolver', () => {

  it('should be empty for no headers', () =>
    expect(resolve({}, {})).to.be.undefined);

  it('should be en because of accept-language header', () =>
    expect(resolve({'accept-language': 'en-US,en;q=0.8,he;q=0.6'}, {})).to.equal('en'));

  it('should be en because empty accept language header', () =>
    expect(resolve({'accept-language': ''}, {})).to.be.undefined);

  it('should be he because of cookie of wix language', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8'
    }, {'wixLanguage': 'he'})).to.equal('he'));

  it('should be pt because language in wix header X-Wix-Base-Uri', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'http://pt.wix.com/xxx'
    })).to.equal('pt'));

  it('should be en because wix header X-Wix-Base-Uri is invalid url', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'invalid url'
    }, {})).to.equal('en'));

  it('should be en because wix header X-Wix-Base-Uri is wwww', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'www.kfir.com'
    }, {})).to.equal('en'));

  it('should be fr because language in domain', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'http://pt.wix.com/xxx',
      'host': 'fr.wix.com'
    })).to.equal('fr'));

  it('should be pt because language in domain is not a language', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'http://pt.wix.com/xxx',
      'host': 'www.wix.com'
    })).to.equal('pt'));

  it('should be jp because language in rpc header', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'http://pt.wix.com/xxx',
      'host': 'fr.wix.com',
      'x-wix-language': 'jp'
    })).to.equal('jp'));
});