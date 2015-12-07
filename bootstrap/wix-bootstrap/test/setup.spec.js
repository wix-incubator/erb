'use strict';
const bootstrap = require('..'),
  config = require('../lib/config/config'),
  configSupport = require('./support/config'),
  expect = require('chai').expect,
  shelljs = require('shelljs');

describe('wix bootstrap setup', () => {
  const tempFolder = './target/conf/';

  beforeEach(() => {
    process.env.APP_CONF_DIR = tempFolder;
    shelljs.mkdir('-p', tempFolder);
  });

  afterEach(() => shelljs.rm('-rf', tempFolder));

  it('should load config from file if no object is provided', () => {
    const config = withBootstrapConfig(configSupport.valid());

    bootstrap.setup();

    expect(bootstrap.config()).to.deep.equal(config);
  });

  it('should not fail if env variable APP_CONF_DIR is not provided and complete config is provided via setup args', () => {
    delete process.env.APP_CONF_DIR;
    bootstrap.setup(configSupport.valid());
  });

  it('should fail if config object is not provided and env variable APP_CONF_DIR is missing', () => {
    delete process.env.APP_CONF_DIR;
    expect(() => bootstrap.setup()).to.throw(Error, `Failed to load config from \'APP_CONF_DIR/${config.configName}\' - is it there?`);
  });

  it('should fail if config object is not provided and \'wix-bootstrap.json\' is missing', () => {
    expect(() => bootstrap.setup()).to.throw(Error, `Failed to load config from \'APP_CONF_DIR/${config.configName}\' - is it there?`);
  });

  it('should fail if config object is not provided and \'wix-bootstrap.json\' is not a valid json', () => {
    'not {} a "" json'.to(tempFolder + config.configName);
    expect(() => bootstrap.setup()).to.throw(Error, `Failed to load config from \'APP_CONF_DIR/${config.configName}\' - is it there?`);
  });

  it('should override config file values with provided via object', () => {
    const fileConfig = withBootstrapConfig(configSupport.valid());
    const objectConfig = configSupport.withValue('express.requestTimeout', 20);

    expect(fileConfig.express.requestTimeout).to.not.equal(objectConfig.express.requestTimeout);

    bootstrap.setup(objectConfig);

    expect(bootstrap.config()).to.deep.equal(objectConfig);
  });

  it('should pass given incomplete config file is completed with object provided via setup()', () => {
    withBootstrapConfig(configSupport.without('express'));
    const objectConfig = configSupport.withValue('express.requestTimeout', 20);

    bootstrap.setup(objectConfig);

    expect(bootstrap.config()).to.deep.equal(objectConfig);
  });


  it('should not fail if config file is not present and complete config is provided via setup args', () => {
    bootstrap.setup(configSupport.valid());
  });


  it('should not load config file if complete config object is provided via setup() args', () => {
    const config = configSupport.valid();

    bootstrap.setup(config);
    expect(bootstrap.config()).to.deep.equal(config);
  });


  function withBootstrapConfig(conf) {
    JSON.stringify(conf).to(tempFolder + config.configName);
    return conf;
  }
});