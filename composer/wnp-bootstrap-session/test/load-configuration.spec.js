const loadConfiguration = require('../lib/load-configuration'),
  {devKey} = require('wix-session-crypto'),  
  WixConfig = require('wix-config'),
  sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger;

describe('load-configuration', () => {

  it('prioritize env variable', () => {
    const {load, log} = loadConfigurationMocks();
    const env = {WIX_BOOT_SESSION2_KEY: 'two'};

    const sessionKey = load(env);

    expect(sessionKey).to.deep.equal('two');
    expect(log.debug).to.have.been.calledWithMatch('env variable');
  });

  it('load from production config if environment variable is not set', () => {
    const {load, log, config} = loadConfigurationMocks();
    config.text.withArgs('wnp-bootstrap-session2.pub').returns('two');

    const sessionKey = load({NODE_ENV: 'production'});

    expect(sessionKey).to.deep.equal('two');
    expect(log.debug).to.have.been.calledWithMatch('production mode detected');
  });
  
  it('uses dev key for dev mode and when env variable is not provided', () => {
    const {load, log} = loadConfigurationMocks();

    const sessionKey = load();

    expect(sessionKey).to.deep.equal(devKey);
    expect(log.debug).to.have.been.calledWithMatch('dev mode detected');
  });
  
  function loadConfigurationMocks() {
    const config = sinon.createStubInstance(WixConfig);
    const log = sinon.createStubInstance(Logger);
    const load = (env = {}) => loadConfiguration({env, config, log});

    return {config, log, load};
  }
});
