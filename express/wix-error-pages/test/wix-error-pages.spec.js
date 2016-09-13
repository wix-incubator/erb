'use strict';
const expect = require('chai').expect;
const wixErrorPages = require('../lib/wix-error-pages')();



// const request = require('request'),
//   expect = require('chai').expect,
//   wixPatchServerResponse = require('..'),
//   testkit = require('wix-http-testkit');

const config = {
  templatePath: './test/mockTemplate.vm',
  staticsUrl: 'path/to/staticsUrl'
};


describe('wix-error-pages', () => {
  beforeEach(() => {
    return wixErrorPages.setup(config);
  });

  it('should render 500 page when calling render500', () => {
    const html = wixErrorPages.render500();
    expect(html).to.contain(`staticsUrl: ${config.staticsUrl}`);
    // expect(html).to.contain('baseDomain: local.wix');
    // expect(html).to.contain('language: en');
    expect(html).to.contain('errorCode: 500');
    // expect(html).to.contain('data: ');
    // expect(html).to.contain('exceptionName: ');
    expect(html).to.contain('serverErrorCode: 500');

  });

  it('should render 504 page when calling render504', () => {
    const html = wixErrorPages.render504();
    expect(html).to.contain('errorCode: 504');
    expect(html).to.contain('serverErrorCode: 504');
  });


  it('should throw error if templatePath is invalid', (done) => {
    wixErrorPages.setup({templatePath: './test/mockTemplate.vm'})
    .then(() => {
      console.log('ethan - got then');
      expectt(true).to.equal(false);
      done()
    }).catch((err) => {
      console.log('ethan - got catch', err);
      expect(true).to.be.true;
      done();
    });
  });

});