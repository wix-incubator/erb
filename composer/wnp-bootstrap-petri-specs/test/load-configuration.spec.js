const loadConfiguration = require('../lib/load-configuration'),
  WixConfig = require('wix-config'),
  sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger,
  constants = require('../lib/constants');

describe('load-configuration', () => {

  it('prioritize env variable', () => {
    const {load, log} = loadConfigurationMocks();
    const env = {'WIX_BOOT_PETRI_URL': 'http://for-test'};

    const url = load(env);

    expect(url).to.deep.equal('http://for-test');
    expect(log.debug).to.have.been.calledWithMatch('env variable');
  });

  it('load from production config if environment variable is not set', () => {
    const {load, log, config} = loadConfigurationMocks();
    config.json.withArgs(constants.configName).returns({services: {petri: 'http://for-test-from-config'}});

    const url = load({NODE_ENV: 'production'});

    expect(url).to.deep.equal('http://for-test-from-config');
    expect(log.debug).to.have.been.calledWithMatch('production mode detected');
  });

  it('uses dev key for dev mode when env variable is not provided', () => {
    const {load, log} = loadConfigurationMocks();

    const configuration = load();

    expect(configuration).to.deep.equal(constants.devUrl);
    expect(log.debug).to.have.been.calledWithMatch('dev mode detected');
  });

  function loadConfigurationMocks() {
    const config = sinon.createStubInstance(WixConfig);
    const log = sinon.createStubInstance(Logger);
    const load = (env = {}) => loadConfiguration({env, config, log});
    return {config, log, load};
  }
});
