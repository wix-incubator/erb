'use strict';
const expect = require('chai').expect,
  mockery = require('mockery');

describe('wix config', () => {
  let wixConfig;

  beforeEach(() => {
    process.env.APP_CONF_DIR = './test/configs';
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    wixConfig = require('..');
  });

  afterEach(() => mockery.disable());

  it('should load a config', () => {
    expect(wixConfig.get('config1')).to.deep.equal({'config1-key': 'config1-value'});
  });

  it('should return cached config on subsequent get', () => {
    wixConfig.get('config1');
    delete process.env.APP_CONF_DIR;
    expect(wixConfig.get('config1')).to.deep.equal({'config1-key': 'config1-value'});
  });

  it('should load multiple configs', () => {
    wixConfig.get('config1');
    wixConfig.get('config2');

    expect(wixConfig.get('config1')).to.deep.equal({'config1-key': 'config1-value'});
    expect(wixConfig.get('config2')).to.deep.equal({'config2-key': 'config2-value'});
  });

  it('should fail if environment variable "APP_CONF_DIR" is missing', () => {
    delete process.env.APP_CONF_DIR;
    expect(() => wixConfig.get('config1')).to.throw('APP_CONF_DIR');
  });

  it('should fail if config name is not provided', () => {
    expect(() => wixConfig.get()).to.throw('cannot be empty');
  });
});