const loadConfiguration = require('../lib/load-configuration'),
  WixConfig = require('wix-config'),
  sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger,
  constants = require('../lib/constants');

describe('load-configuration', () => {

  it('prioritize env variable', () => {
    const {load, log} = loadConfigurationMocks();
    const env = {'WIX_BOOT_SEEN_BY': '123'};

    const seenBy = load(env);

    expect(seenBy).to.equal('123');
    expect(log.debug).to.have.been.calledWithMatch('env variable');
  });

  it('load from production config if environment variable is not set', () => {
    const {load, log, config} = loadConfigurationMocks();
    config.json.withArgs(constants.configName).returns({requestContext: {seenBy: 'two'}});

    const seenBy = load({NODE_ENV: 'production'});

    expect(seenBy).to.deep.equal('two');
    expect(log.debug).to.have.been.calledWithMatch('production mode detected');
  });

  it('uses dev key for dev mode when env variable is not provided', () => {
    const {load, log} = loadConfigurationMocks();

    const seenBy = load();

    expect(seenBy).to.deep.equal(constants.devSeenBy);
    expect(log.debug).to.have.been.calledWithMatch('dev mode detected');
  });

  function loadConfigurationMocks() {
    const config = sinon.createStubInstance(WixConfig);
    const log = sinon.createStubInstance(Logger);
    const load = (env = {}) => loadConfiguration({env, config, log});

    return {config, log, load};
  }
});
