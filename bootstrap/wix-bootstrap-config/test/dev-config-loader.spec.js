'use strict';
const DevLoader = require('../lib/loaders/dev-config-loader'),
  expect = require('chai').expect,
  intercept = require('intercept-stdout');

describe('wix dev config loader', () => {
  let capturedOut, unhook;

  beforeEach(() => {
    capturedOut = '';
    process.env.NODE_ENV = 'development';
    unhook = intercept(txt => {
      capturedOut += txt;
    });
  });

  afterEach(() => unhook());

  it('should not write to stdout about dev mode on cluster worker process', () => {
    const loader = new DevLoader('wix-bootstrap');
    loader.load({}, cluster(false));

    expect(capturedOut).to.not.be.string('DEV mode detected and config file is missing');
  });

  it('should write to stdout about dev mode on cluster master process', () => {
    const loader = new DevLoader('wix-bootstrap');
    loader.load({}, cluster(true));

    expect(capturedOut).to.be.string('DEV mode detected and config file is missing');
  });

});

function cluster(isMaster) {
  return {
    isMaster: isMaster
  };
}
