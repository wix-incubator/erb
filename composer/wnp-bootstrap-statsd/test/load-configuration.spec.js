const loadConfiguration = require('../lib/load-configuration'),
  constants = require('../lib/constants'),
  WixConfig = require('wix-config'),
  sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger;

describe('load-configuration', () => {

  it('should not load production config if WIX_BOOT_STATSD_HOST is set', () => {
    const {load, log} = loadConfigurationMocks();
    const env = {'WIX_BOOT_STATSD_HOST': 'one'};

    const configuration = load(env);

    expect(configuration).to.deep.equal({host: 'one', interval: constants.interval});
    expect(log.debug).to.have.been.calledWithMatch('env variable');
    expect(log.debug).to.have.been.calledWithMatch('no environment variable');
  });

  it('should load production config if WIX_BOOT_STATSD_HOST is not set', () => {
    const {load, log, config} = loadConfigurationMocks();
    config.json.withArgs(constants.configName).returns({statsd: {host: 'two'}});    

    const configuration = load({NODE_ENV: 'production'});

    expect(configuration).to.deep.equal({host: 'two', interval: constants.interval});
    expect(log.debug).to.have.been.calledWithMatch('production mode detected');
  });

  it('should load "localhost" for dev mode', () => {
    const {load, log} = loadConfigurationMocks();

    const configuration = load();

    expect(configuration).to.deep.equal({host: 'localhost', interval: constants.interval});
    expect(log.debug).to.have.been.calledWithMatch('dev mode detected');
  });

  it('should override interval with env varibale', () => {
    const {load} = loadConfigurationMocks();

    const configuration = load({'WIX_BOOT_STATSD_INTERVAL': 20});

    expect(configuration).to.deep.equal({host: 'localhost', interval: 20});
  });
  
  function loadConfigurationMocks() {
    const config = sinon.createStubInstance(WixConfig);
    const log = sinon.createStubInstance(Logger);
    const load = (env = {}) => loadConfiguration({env, config, log});

    return {config, log, load};
  }
});
