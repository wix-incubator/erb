const loadConfiguration = require('../lib/load-configuration'),
  WixConfig = require('wix-config'),
  sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger,
  constants = require('../lib/constants'),
  os = require('os');

describe('load-configuration', () => {

  it('prioritize env variable for seen by', () => {
    const {load, log} = loadConfigurationMocks();
    const env = {'WIX_BOOT_SEEN_BY': '123'};

    const {seenBy} = load(env);

    expect(seenBy).to.equal('123');
    expect(log.debug).to.have.been.calledWithMatch('env variable');
  });

  it('prioritize env variable for public statics url', () => {
    const {load, log} = loadConfigurationMocks();
    const env = {'WIX_BOOT_PUBLIC_STATICS_URL': '123'};

    const {publicStaticsUrl} = load(env);

    expect(publicStaticsUrl).to.equal('123');
    expect(log.debug).to.have.been.calledWithMatch('env variable');
  });

  it('load from production config if environment variable is not set', () => {
    const {load, log, config} = loadConfigurationMocks();
    config.json.withArgs(constants.configName).returns({requestContext: {seenBy: 'two'}, publicStaticsUrl: 'three'});

    const {seenBy, publicStaticsUrl} = load({NODE_ENV: 'production'});

    expect(seenBy).to.deep.equal('two');
    expect(publicStaticsUrl).to.deep.equal('three');
    expect(log.debug).to.have.been.calledWithMatch('production mode detected');
  });

  it('uses dev key for dev mode when env variable is not provided', () => {
    const {load, log, artifactInfo} = loadConfigurationMocks();

    const {seenBy, publicStaticsUrl} = load();

    expect(seenBy).to.deep.equal(`${os.hostname()}.${artifactInfo.name}`);
    expect(publicStaticsUrl).to.deep.equal(constants.devPublicStaticsUrl);
    expect(log.debug).to.have.been.calledWithMatch('dev mode detected');
  });

  function loadConfigurationMocks() {
    const artifactInfo = {name: 'artifact-name'};
    const config = sinon.createStubInstance(WixConfig);
    const log = sinon.createStubInstance(Logger);
    const load = (env = {}) => loadConfiguration({env, config, artifactInfo, log});

    return {config, log, load, artifactInfo};
  }
});
