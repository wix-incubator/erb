const loadConfiguration = require('../lib/load-configuration'),
  wixRpcClientSupport = require('wix-rpc-client-support'),
  WixConfig = require('wix-config'),
  sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger,
  constants = require('../lib/constants');

describe('load-configuration', () => {

  it('prioritize env variable', () => {
    const {load, log} = loadConfigurationMocks();
    const env = {'WIX_BOOT_RPC_SIGNING_KEY': '123'};

    const configuration = load(env);

    expect(configuration).to.deep.equal({signingKey: '123', timeout: constants.defaultTimeout});
    expect(log.debug).to.have.been.calledWithMatch('env variable');
  });

  it('load from production config if environment variable is not set', () => {
    const {load, log, config} = loadConfigurationMocks();
    config.json.withArgs(constants.configName).returns({rpc: {signingKey: 'two'}});

    const configuration = load({NODE_ENV: 'production'});

    expect(configuration).to.deep.equal({signingKey: 'two', timeout: constants.defaultTimeout});
    expect(log.debug).to.have.been.calledWithMatch('production mode detected');
  });

  it('uses dev key for dev mode when env variable is not provided', () => {
    const {load, log} = loadConfigurationMocks();

    const configuration = load();

    expect(configuration).to.deep.equal({signingKey: wixRpcClientSupport.devSigningKey, timeout: constants.defaultTimeout});
    expect(log.debug).to.have.been.calledWithMatch('dev mode detected');
  });
  
  function loadConfigurationMocks() {
    const config = sinon.createStubInstance(WixConfig);
    const log = sinon.createStubInstance(Logger);
    const load = (env = {}) => loadConfiguration({env, config, log});

    return {config, log, load};
  }
});
