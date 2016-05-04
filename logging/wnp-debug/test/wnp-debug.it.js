'use strict';
const debug = require('..'),
  testkit = require('wix-stdouterr-testkit'),
  expect = require('chai').expect;

describe('wnp debug', () => {
  beforeEach(() => require('debug').enable('*'));

  const interceptor = testkit.interceptor().beforeAndAfterEach();

  it('should log to stdout with prefix', () => {
    debug().info('info log');

    expect(interceptor.stdout).to.be.string('wnp:debug');
    expect(interceptor.stdout).to.be.string('info log');
  });

  it('should log to stderr with prefix', () => {
    debug().error('error log');

    expect(interceptor.stderr).to.be.string('wnp:debug');
    expect(interceptor.stderr).to.be.string('error log');
  });

});