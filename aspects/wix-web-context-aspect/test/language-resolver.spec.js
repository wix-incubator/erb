const expect = require('chai').expect,
  language = require('../lib/resolvers/language'),
  resolve = language.resolve,
  supportedLangages = language.supportedLanguages;

describe('language resolver', () => {

  it('resolves supported languages', () => {
    supportedLangages
      .forEach(lang => expect(resolve({}, {'wixLanguage': lang})).to.equal(lang));
  });

  it('falls back to en for unsupported language', () => {
    expect(resolve({}, {'wixLanguage': 'aa'})).to.equal('en');
  });

  it('should be en for no headers', () =>
    expect(resolve({}, {})).to.equal('en'));

  it('should be en because of accept-language header', () =>
    expect(resolve({'accept-language': 'en-US,en;q=0.8,he;q=0.6'}, {})).to.equal('en'));

  it('should be en because empty accept language header', () =>
    expect(resolve({'accept-language': ''}, {})).to.equal('en'));

  it('should be ru because of cookie of wix language', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8'
    }, {'wixLanguage': 'ru'})).to.equal('ru'));

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

  it('should be ja because language in rpc header', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'http://pt.wix.com/xxx',
      'host': 'fr.wix.com',
      'x-wix-language': 'ja'
    })).to.equal('ja'));

  it('should be fallabck for malformed languages in headers, cookie, host', () => {
    expect(resolve({
      'accept-language': 'zzzzz,12;q=0.8',
      'x-wix-base-uri': 'http://qwe.wix.com/xxx',
      'host': 'bababa.wix.com',
      'x-wix-language': 'oh-bo'
    }, {'wixLanguage': 'woopwoop'})).to.equal('en')
  });

  it('should return language from first valid source', () => {
    expect(resolve({
      'host': 'bababa.wix.com',
    }, {'wixLanguage': 'ja'})).to.equal('ja')
  });

  it('should resolve language from query parameter "overrideLocale"', () => {
    expect(resolve({}, {}, {overrideLocale: 'pt'})).to.equal('pt');
  });
  
  it('should resolve from query parameter "overrideLocale" over subdomain in "Host" header', () => {
    expect(resolve({'host': 'fr.wix.com'}, {}, {overrideLocale: 'pt'})).to.equal('pt');
  });


});
