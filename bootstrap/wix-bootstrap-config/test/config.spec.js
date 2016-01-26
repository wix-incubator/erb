'use strict';
const bootstrapConfig = require('../'),
  configSupport = require('./support/config'),
  expect = require('chai').expect,
  shelljs = require('shelljs');

describe('wix bootstrap config', () => {
  const tempFolder = './target/conf/';

  beforeEach(() => {
    process.env.APP_CONF_DIR = tempFolder;
    shelljs.mkdir('-p', tempFolder);
  });

  afterEach(() => shelljs.rm('-rf', tempFolder));

  it('should load config from file if no object is provided', () => {
    const config = withBootstrapConfig(configSupport.valid());
    expect(bootstrapConfig.load()).to.deep.equal(config);
  });

  it('should not fail if env variable APP_CONF_DIR is not provided and complete config is provided via setup args', () => {
    delete process.env.APP_CONF_DIR;
    bootstrapConfig.load(configSupport.valid());
  });

  it('should fail if config object is not provided and env variable APP_CONF_DIR is missing', () => {
    delete process.env.APP_CONF_DIR;
    expect(() => bootstrapConfig.load()).to.throw(Error, `Failed to load config from \'APP_CONF_DIR/${bootstrapConfig.configName}\' - is it there?`);
  });

  it('should fail if config object is not provided and \'wix-bootstrap.json\' is missing', () => {
    expect(() => bootstrapConfig.load()).to.throw(Error, `Failed to load config from \'APP_CONF_DIR/${bootstrapConfig.configName}\' - is it there?`);
  });

  it('should fail if config object is not provided and \'wix-bootstrap.json\' is not a valid json', () => {
    'not {} a "" json'.to(tempFolder + bootstrapConfig.configName);
    expect(() => bootstrapConfig.load()).to.throw(Error, `Failed to load config from \'APP_CONF_DIR/${bootstrapConfig.configName}\' - is it there?`);
  });

  it('should override config file values with provided via object', () => {
    const fileConfig = withBootstrapConfig(configSupport.valid());
    const objectConfig = configSupport.withValue('express.requestTimeout', 20);

    expect(fileConfig.express.requestTimeout).to.not.equal(objectConfig.express.requestTimeout);

    expect(bootstrapConfig.load(objectConfig)).to.deep.equal(objectConfig);
  });

  it('should pass given incomplete config file is completed with object provided via setup()', () => {
    withBootstrapConfig(configSupport.without('express'));
    const objectConfig = configSupport.withValue('express.requestTimeout', 20);

    expect(bootstrapConfig.load(objectConfig)).to.deep.equal(objectConfig);
  });


  it('should not fail if config file is not present and complete config is provided via setup args', () => {
    bootstrapConfig.load(configSupport.valid());
  });


  it('should not load config file if complete config object is provided via setup() args', () => {
    const config = configSupport.valid();

    expect(bootstrapConfig.load(config)).to.deep.equal(config);
  });


  function withBootstrapConfig(conf) {
    JSON.stringify(conf).to(tempFolder + bootstrapConfig.configName);
    return conf;
  }
});