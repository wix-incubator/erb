'use strict';
const bootstrapConfig = require('../'),
  configSupport = require('./support/config'),
  expect = require('chai').expect,
  shelljs = require('shelljs'),
  intercept = require('intercept-stdout'),
  wixConfig = require('wix-config');

describe('wix bootstrap config', () => {
  const tempFolder = './target/conf/';
  const currentEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    bootstrapConfig.setup(tempFolder);
    shelljs.mkdir('-p', tempFolder);
  });

  afterEach(() => {
    process.env.NODE_ENV = currentEnv;
    shelljs.rm('-rf', tempFolder);
  });

  it('should load config from file if no object is provided', () => {
    const config = withBootstrapConfig(configSupport.valid());
    expect(bootstrapConfig.load()).to.deep.equal(config);
  });

  it('should not fail if complete config is provided via setup args', () => {
    delete process.env.APP_CONF_DIR;
    bootstrapConfig.load(configSupport.valid());
  });

  it('should fail if config object is not provided and \'wix-bootstrap.json\' is missing', () => {
    expect(() => bootstrapConfig.load()).to.throw(Error, `no such file or directory`);
  });

  it('should fail if config object is not provided and \'wix-bootstrap.json\' is not a valid json', () => {
    'not {} a "" json'.to(tempFolder + bootstrapConfig.configName);
    expect(() => bootstrapConfig.load()).to.throw(Error, `no such file or directory`);
  });

  it('should override config file values with provided via object', () => {
    const fileConfig = withBootstrapConfig(configSupport.valid());
    const objectConfig = configSupport.withValue('express.requestTimeout', 999);

    expect(fileConfig.express.requestTimeout).to.not.equal(objectConfig.express.requestTimeout);
    expect(bootstrapConfig.load(objectConfig)).to.deep.equal(objectConfig);
  });

  it('should pass given incomplete config file is completed with object provided via setup()', () => {
    withBootstrapConfig(configSupport.without('express'));
    const objectConfig = configSupport.withValue('express.requestTimeout', 20);

    expect(bootstrapConfig.load(objectConfig)).to.deep.equal(objectConfig);
  });

  it('should not load config file if complete config object is provided via setup() args', () => {
    const config = configSupport.valid();

    expect(bootstrapConfig.load(config)).to.deep.equal(config);
  });

  describe('dev mode', () => {
    let capturedOut, unhook;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      unhook = intercept(txt => {
        capturedOut += txt;
      });
    });

    afterEach(() => unhook());

    it('should inject defaults given app is running not in production mode and config is missing', () => {
      const devConfig = configSupport.valid();
      expect(bootstrapConfig.load()).to.deep.equal(devConfig);
    });

    it('should load values form file over stub config', () => {
      withBootstrapConfig(configSupport.withValue('express.requestTimeout', 999));
      expect(bootstrapConfig.load()).to.contain.deep.property('express.requestTimeout', 999);
    });

    it('should load values form explicit config over ', () => {
      const loadedConfig = bootstrapConfig.load({
        express: {
          requestTimeout: 212
        }
      });

      expect(loadedConfig).to.contain.deep.property('express.requestTimeout', 212);
    });

    it('should print to stdout that default values are used for dev', () => {
      const stubConfig = configSupport.valid();
      expect(bootstrapConfig.load()).to.deep.equal(stubConfig);

      expect('DEV mode detected and config file is missing, preloading stub values: ' + JSON.stringify(stubConfig));
    });

    it('should validate config in dev mode', () => {
      const stubConfig = configSupport.withValue('express.requestTimeout', {});
      expect(() => bootstrapConfig.load(stubConfig)).to.throw(Error);
    });

  });


  function withBootstrapConfig(conf) {
    JSON.stringify(conf).to(tempFolder + bootstrapConfig.configName + '.json');
    return conf;
  }
});