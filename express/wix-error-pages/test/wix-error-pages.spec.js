const expect = require('chai').expect;
const WixErrorPages = require('../lib/wix-error-pages');

const config = {
  staticBaseUrl: 'https://static.parastorage.com/',
  wixPublicStaticsUrl: '//static.parastorage.com/services/wix-public/1.209.0',
  wixPublicLocalFilePath: './dependencies/com.wixpress.framework.wix-error-assets/views/errorPages',
};

const cookieDomain = 'www.wix.com';

const req = ({debug, locale}) => {
  return {
    aspects: {
      'web-context': {
        debug: debug,
        locale: locale,
        cookieDomain: cookieDomain
      }
    }
  }
};

describe('wix-error-pages', () => {
  let wixErrorPages;
  beforeEach(() => {
    wixErrorPages = new WixErrorPages(config);
    return wixErrorPages.init();
  });

  it('should render 500 page when calling render500', () => {
    const html = wixErrorPages.render500(req({debug: true, locale: 'en'}));
    expect(html).to.contain('messages_en.js');
    expect(html).to.contain(`.constant('baseDomain', '${cookieDomain}')`);
    expect(html).to.contain(`.constant('staticsUrl', '${config.wixPublicStaticsUrl}/')`);
    expect(html).to.contain('.constant(\'errorCode\', {code: \'500\'})');
    expect(html).to.contain('.constant(\'data\', {})');
    expect(html).to.contain('.constant(\'serverErrorCode\', \'-199\')');
  });

  it('should render with different contents if debug is true', () => {
    const htmlWithoutDebug = wixErrorPages.render500(req({debug: false, locale: 'en'}));
    const htmlWithDebug = wixErrorPages.render500(req({debug: true, locale: 'en'}));
    expect(htmlWithDebug).to.not.equal(htmlWithoutDebug);
  });


  it('should render with default locale', () => {
    const html = wixErrorPages.render500(req({debug: false, locale: '??'}));
    expect(html).to.contain('messages_en.js');
  });

  it('should render with provided locale', () => {
    const html = wixErrorPages.render500(req({debug: false, locale: 'es'}));
    expect(html).to.contain('messages_es.js');
  });
});
