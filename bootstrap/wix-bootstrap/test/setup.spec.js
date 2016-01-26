'use strict';
const bootstrap = require('..'),
  bootstrapConfig = require('wix-bootstrap-config'),
  expect = require('chai').expect,
  shelljs = require('shelljs');

describe('wix bootstrap setup', () => {

  it('should load config from file if no object is provided', () => {
    process.env.APP_CONF_DIR = './node_modules/wix-bootstrap-config/configs';
    const config = bootstrapConfig.load();

    bootstrap.setup();

    expect(bootstrap.config()).to.deep.equal(config);
  });

  it('should pass-on config object provided via setup() to an config loader and ignore config file', () => {
    process.env.APP_CONF_DIR = './node_modules/wix-bootstrap-config/configs';
    const config = bootstrapConfig.load();
    delete process.env.APP_CONF_DIR;

    bootstrap.setup(config);

    expect(bootstrap.config()).to.deep.equal(config);
  });
});