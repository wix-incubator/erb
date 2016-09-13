'use strict';
const expect = require('chai').expect;
const wixErrorPages = require('../lib/wix-error-pages')();

// const request = require('request'),
//   expect = require('chai').expect,
//   wixPatchServerResponse = require('..'),
//   testkit = require('wix-http-testkit');

describe('wix-error-pages', () => {
  it('should true be true', () => {
    expect(true).to.be.true;
  });

  it('should render 500 page when calling render500', () => {
    const html = wixErrorPages.render500();
    expect(html).to.equal('Internal Server Error');
  });

  it('should render 504 page when calling render500', () => {
    const html = wixErrorPages.render504();
    expect(html).to.equal('Gateway Timeout');
  });
});