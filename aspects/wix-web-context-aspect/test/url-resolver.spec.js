'use strict';
const expect = require('chai').expect,
  resolve = require('../lib/resolvers/url').resolve;

describe('url resolver', () => {

  it('should resolve url from header', () =>
    expect(resolve({'x-wix-url': 'http://qwe.qwe/qwe'})).to.equal('http://qwe.qwe/qwe'));

  it('should fallback to explicit url', () =>
    expect(resolve({}, 'http://default')).to.equal('http://default'));
});
