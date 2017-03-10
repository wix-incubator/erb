const expect = require('chai').expect,
  language = require('../lib/resolvers/language'),
  resolve = language.resolve,
  supportedLangages = language.supportedLanguages;

describe('language resolver', () => {

  it('resolves supported languages', () => {
    supportedLangages.forEach(lang => expect(resolve({}, {'wixLanguage': lang})).to.equal(lang));
  });

  it('falls back to en for unsupported language', () => {
    expect(resolve({}, {'wixLanguage': 'aa'})).to.equal('en');
  });

  it('sets en as default when no headers, cookies, query params provided', () =>
    expect(resolve({}, {})).to.equal('en'));

  it('resolves from accept-language header', () =>
    expect(resolve({'accept-language': 'en-US,en;q=0.8,he;q=0.6'}, {})).to.equal('en'));

  it('falls back to en if accept-language is provided, but empty', () =>
    expect(resolve({'accept-language': ''}, {})).to.equal('en'));

  it('prioritizes cookie over accept-language', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8'
    }, {'wixLanguage': 'ru'})).to.equal('ru'));

  it('prioritized X-Wix-Base-Uri over accept-language', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'http://pt.wix.com/xxx'
    })).to.equal('pt'));

  it('skips X-Wix-Base-Uri with invalid url', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'invalid url'
    }, {})).to.equal('en'));

  it('skips X-Wix-Base-Uri with url with no language in domain', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'www.kfir.com'
    }, {})).to.equal('en'));

  it('prioritized x-wix-base-uri over accept-language and host', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'http://pt.wix.com/xxx',
      'host': 'fr.wix.com'
    })).to.equal('fr'));

  it('prioritizes x-wix-language header over accept-language, host and x-wix-base-uri', () =>
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'http://pt.wix.com/xxx',
      'host': 'fr.wix.com',
      'x-wix-language': 'ja'
    })).to.equal('ja'));

  it('uses fallback (en) for malformed languages in headers, cookie, host', () => {
    expect(resolve({
      'accept-language': 'zzzzz,12;q=0.8',
      'x-wix-base-uri': 'http://qwe.wix.com/xxx',
      'host': 'bababa.wix.com',
      'x-wix-language': 'oh-bo'
    }, {'wixLanguage': 'woopwoop'})).to.equal('en')
  });

  it('returns language from first valid source', () => {
    expect(resolve({
      'host': 'bababa.wix.com',
    }, {'wixLanguage': 'ja'})).to.equal('ja')
  });

  it('prioritizes rpc header over query param', () => {
    expect(resolve({
      'accept-language': 'en-US,en;q=0.8',
      'x-wix-base-uri': 'http://pt.wix.com/xxx',
      'host': 'fr.wix.com',
      'x-wix-language': 'ko'
    }, {'wixLanguage': 'nl'}, {overrideLocale: 'es'})).to.equal('ko');
  });

  it('resolves language from query parameter "overrideLocale"', () => {
    expect(resolve({}, {}, {overrideLocale: 'pt'})).to.equal('pt');
  });

  it('resolves from query parameter "overrideLocale" over subdomain in "Host" header', () => {
    expect(resolve({'host': 'fr.wix.com'}, {}, {overrideLocale: 'pt'})).to.equal('pt');
  });
});
