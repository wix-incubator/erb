'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  sinonJs = require('sinon'),
  runMode = require('wix-run-mode'),
  log = require('wnp-debug')('test'),
  envAugmentor = require('../../lib/before-start/env-augmentor');

describe('env-augmentor', () => {
  let sinon, match = sinonJs.match;

  beforeEach(() => sinon = sinonJs.sandbox.create());
  afterEach(() => sinon.verifyAndRestore());

  it('should inject defaults for app environment variables if they are missing in devMode', () => {
    sinon.stub(runMode, 'isProduction').returns(false);
    const debug = sinon.spy(log, 'debug');
    const env = {};
    envAugmentor(runMode, env, log);

    expect(env).to.deep.equal({
      PORT: 3000,
      MANAGEMENT_PORT: 3004,
      MOUNT_POINT: '',
      APP_CONF_DIR: './test/configs',
      APP_TEMPL_DIR: './templates',
      APP_LOG_DIR: './target/logs',
      HOSTNAME: 'localhost'
    });

    expect(debug).to.be.calledWithMatch(match('DEV mode detected and required env variables are missing, pre-loading stub values:'));
  });

  it('should not override environment values that are already set in devMode', () => {
    sinon.stub(runMode, 'isProduction').returns(false);
    const debug = sinon.spy(log, 'debug');
    const env = {
      PORT: 1,
      MOUNT_POINT: '/qwe',
      APP_CONF_DIR: '/qweqwe',
      APP_TEMPL_DIR: '/qweqweqweqwe',
      APP_LOG_DIR: './qweqweqweqweqwe',
      HOSTNAME: 'dev',
      NEW_RELIC_ENABLED: 3,
      NEW_RELIC_NO_CONFIG_FILE: 4,
      NEW_RELIC_LOG: 'qweqwe'
    };
    envAugmentor(runMode, env, log);

    expect(env).to.deep.equal({
      PORT: 1,
      MANAGEMENT_PORT: 3004,
      MOUNT_POINT: '/qwe',
      APP_CONF_DIR: '/qweqwe',
      APP_TEMPL_DIR: '/qweqweqweqwe',
      APP_LOG_DIR: './qweqweqweqweqwe',
      HOSTNAME: 'dev',
      NEW_RELIC_ENABLED: 3,
      NEW_RELIC_NO_CONFIG_FILE: 4,
      NEW_RELIC_LOG: 'qweqwe'
    });
    expect(debug).to.be.calledWithMatch(match('DEV mode detected and required env variables are missing, pre-loading stub values:'));
  });

  it('should be a noop if NODE_ENV is set to \'production\'', () => {
    sinon.stub(runMode, 'isProduction').returns(true);
    const debug = sinon.spy(log, 'debug');
    const env = {};
    envAugmentor(runMode, env, log);

    expect(env).to.deep.equal({});
    expect(debug.callCount).to.equal(0);
  });
});