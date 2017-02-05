const loadConfiguration = require('../lib/load-configuration'),
  sessionCrypto = require('wix-session-crypto'),  
  WixConfig = require('wix-config'),
  sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger;

describe('load-configuration', () => {

  it('prioritize env variables', () => {
    const {load, log} = loadConfigurationMocks();
    const env = {'WIX_BOOT_SESSION_KEY': 'one', 'WIX_BOOT_SESSION2_KEY': 'two'};

    const sessionKeys = load(env);

    expect(sessionKeys).to.deep.equal({sessionKey: 'one', session2Key: 'two'});
    expect(log.debug).to.have.been.calledWithMatch('env variables');
  });

  it('load from production configs if environment variables are not set', () => {
    const {load, log, config} = loadConfigurationMocks();
    config.json.withArgs('wnp-bootstrap-session.json').returns({session: {mainKey: 'one'}});
    config.text.withArgs('wnp-bootstrap-session2.pub').returns('two');

    const sessionKeys = load({NODE_ENV: 'production'});

    expect(sessionKeys).to.deep.equal({sessionKey: 'one', session2Key: 'two'});
    expect(log.debug).to.have.been.calledWithMatch('production mode detected');
  });
  
  it('uses dev keys for dev mode and when env variables are not provided', () => {
    const {load, log} = loadConfigurationMocks();

    const sessionKeys = load();

    expect(sessionKeys).to.deep.equal({sessionKey: sessionCrypto.v1.devKey, session2Key: sessionCrypto.v2.devKey});
    expect(log.debug).to.have.been.calledWithMatch('dev mode detected');
  });
  
  function loadConfigurationMocks() {
    const config = sinon.createStubInstance(WixConfig);
    const log = sinon.createStubInstance(Logger);
    const load = (env = {}) => loadConfiguration({env, config, log});

    return {config, log, load};
  }
});
