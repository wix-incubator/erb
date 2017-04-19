const {expect} = require('chai');
const wixErrorPages = require('..');

describe('error page renderer with default template', () => {
  const cookieDomain = 'www.wix.com';
  const wixPublicStaticsUrl = '//static.parastorage.com/services/wix-public/1.209.0';

  it('should not leave unsubstituted values', () => {
    const html = render(req({debug: true, locale: 'en'}), 500, -120);
    expect(html).to.not.contain('$');
  });

  it('should render page with provided values', () => {
    const html = render(req({debug: true, locale: 'en'}), 500, -120);
    expect(html).to.contain('messages_en.js');
    expect(html).to.contain(`.constant('baseDomain', '${cookieDomain}')`);
    expect(html).to.contain(`.constant('staticsUrl', '${wixPublicStaticsUrl}/')`);
    expect(html).to.contain('.constant(\'errorCode\', {code: \'500\'})');
    expect(html).to.contain('.constant(\'data\', {})');
    expect(html).to.contain('.constant(\'serverErrorCode\', \'-120\')');
  });

  it('should render with different contents if debug is true', () => {
    const htmlWithoutDebug = render(req({debug: false, locale: 'en'}));
    const htmlWithDebug = render(req({debug: true, locale: 'en'}));
    expect(htmlWithDebug).to.not.equal(htmlWithoutDebug);
  });

  it('should render with default locale', () => {
    const html = render(req({debug: false, locale: '??'}));
    expect(html).to.contain('messages_en.js');
  });

  it('should render with provided locale', () => {
    const html = render(req({debug: false, locale: 'es'}));
    expect(html).to.contain('messages_es.js');
  });

  function render(...args) {
    return wixErrorPages(wixPublicStaticsUrl)(...args);
  }

  function req({debug, locale}) {
    return {
      aspects: {
        'web-context': {
          debug: debug,
          language: locale,
          cookieDomain: cookieDomain
        }
      }
    };
  }
});
