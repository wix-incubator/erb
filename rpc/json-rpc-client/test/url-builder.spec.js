'use strict';
const build = require('../lib/url-builder').build,
  expect = require('chai').expect;

describe('url builder', () => {

  it('should return original url if array with single element is provided', () => {
    expect(build(['http://url'])).to.equal('http://url');
  });

  it('should build a url with "/_rpc/" if provided args contains 2 elements', () => {
    expect(build(['http://localhost', 'Service'])).to.equal('http://localhost/_rpc/Service');
  });

  it('should throw an error if no arguments are provided', () => {
    expect(() => build()).to.throw(Error, 'provided arguments must contain 1..2 elements');
  });

  it('should throw an error if empty argument array is provided', () => {
    expect(() => build([])).to.throw(Error, 'provided arguments must contain 1..2 elements');
  });

  it('should throw an error if array with more than 2 elements provided', () => {
    expect(() => build(['a', 'b', 'c'])).to.throw(Error, 'provided arguments must contain 1..2 elements');
  });
});