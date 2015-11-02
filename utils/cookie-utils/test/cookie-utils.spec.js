'use strict';
const expect = require('chai').expect,
  cookiesUtils = require('..');

describe('cookie utils', () => {

  it('should serialize and deserialize cookies', () => {
    let cookieHeader = 'foo=bar; cat=meow; dog=ruff';

    expect(cookiesUtils.toHeader(cookiesUtils.fromHeader(cookieHeader))).to.equal(cookieHeader);
  });

  it('should serialize and deserialize header with no cookies', () => {
    let cookieHeader = '';

    expect(cookiesUtils.toHeader(cookiesUtils.fromHeader(cookieHeader))).to.equal(cookieHeader);
  });
});