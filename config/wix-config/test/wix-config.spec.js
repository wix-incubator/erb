'use strict';
const wixConfig = require('..'),
  expect = require('chai').expect;

describe('wix config', () => {
  beforeEach(() => process.env.APP_CONF_DIR = './test/configs');

  it('should load a config', () => {
    expect(wixConfig.load('config1')).to.deep.equal({'config1-key': 'config1-value'});
  });

  it('should load multiple configs', () => {
    expect(wixConfig.load('config1')).to.deep.equal({'config1-key': 'config1-value'});
    expect(wixConfig.load('config2')).to.deep.equal({'config2-key': 'config2-value'});
  });

  it('should fail if environment variable "APP_CONF_DIR" is missing', () => {
    delete process.env.APP_CONF_DIR;
    expect(() => wixConfig.load('config1')).to.throw('APP_CONF_DIR');
  });

  it('should fail if config name is not provided', () => {
    expect(() => wixConfig.load()).to.throw('cannot be empty');
  });
});