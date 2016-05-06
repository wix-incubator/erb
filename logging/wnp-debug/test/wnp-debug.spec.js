'use strict';
const debug = require('..'),
  testkit = require('wix-stdouterr-testkit'),
  expect = require('chai').expect;

describe('wnp debug', () => {
  beforeEach(() => require('debug').enable('*'));

  const interceptor = testkit.interceptor().beforeAndAfterEach();

  it('should log info to stderr with prefix', () => {
    debug('debug').info('info log');

    expect(interceptor.stderr).to.be.string('wnp:debug');
    expect(interceptor.stderr).to.be.string('info log');
  });

  it('should log error to stderr with prefix', () => {
    debug('debug').error('error log');

    expect(interceptor.stderr).to.be.string('wnp:debug');
    expect(interceptor.stderr).to.be.string('error log');
  });

  it('should normalize log key', () => {
    debug('wix-debug').error('error log');

    expect(interceptor.stderr).to.be.string('wix:debug');
  });

  it('should fail of log key is not provided', () => {
    expect(() => debug()).to.throw('Name must be provided');
  });

  it('should fail of log key is empty string', () => {
    expect(() => debug('')).to.throw('Name must be provided');
  });

});