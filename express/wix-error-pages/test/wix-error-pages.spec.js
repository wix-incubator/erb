'use strict';
const expect = require('chai').expect;
const WixErrorPages = require('../lib/wix-error-pages');

const config = {
  staticBaseUrl: 'https://static.parastorage.com/',
  wixPublicStaticsUrl: '//static.parastorage.com/services/wix-public/1.209.0/',
  wixPublicLocalFilePath: './test/',
};

const req = {
  aspects: {
    'web-context': {
      debug: false,
      locale: 'en',
      cookieDomain: 'www.wix.com'
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
    const html = wixErrorPages.render500(req);
    expect(html).to.contain(`debug: ${req.aspects['web-context'].debug}`);
    expect(html).to.contain(`locale: ${req.aspects['web-context'].locale}`);
    expect(html).to.contain(`baseDomain: ${req.aspects['web-context'].cookieDomain}`);
    expect(html).to.contain(`staticBaseUrl: ${config.staticBaseUrl}`);
    expect(html).to.contain(`staticsUrl: ${config.wixPublicStaticsUrl}`);
    expect(html).to.contain('errorPageCode: 500');
    expect(html).to.contain('data: {}');
    expect(html).to.contain('serverErrorCode: -199');
    expect(html).to.contain('addBotDetectionSnippet: true');
  });
});