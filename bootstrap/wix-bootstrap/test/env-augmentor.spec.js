'use strict';
const expect = require('chai').expect,
  envAugmentor = require('../lib/globals/env-augmentor'),
  intercept = require('intercept-stdout');

describe('env-augmentor', () => {
  let stdout, detach;

  beforeEach(() => {
    stdout = '';
    detach = intercept(txt => {
      stdout += txt;
    });
  });

  afterEach(() => detach());

  it('should inject defaults for app environment variables if they are missing in devMode', () => {
    const env = {};
    envAugmentor.setup(runModeStub(false), clusterStub(true), env);

    expect(env).to.deep.equal({
      PORT: 3000,
      MANAGEMENT_PORT: 3004,
      MOUNT_POINT: '',
      APP_CONF_DIR: './test/configs',
      NEW_RELIC_ENABLED: false,
      NEW_RELIC_NO_CONFIG_FILE: true,
      NEW_RELIC_LOG: 'stdout'
    });
  });

  it('should not override environment values that are already set in devMode', () => {
    const env = {
      PORT: 1,
      MOUNT_POINT: '/qwe',
      APP_CONF_DIR: '/qweqwe',
      NEW_RELIC_ENABLED: 3,
      NEW_RELIC_NO_CONFIG_FILE: 4,
      NEW_RELIC_LOG: 'qweqwe'
    };
    envAugmentor.setup(runModeStub(false), clusterStub(true), env);

    expect(env).to.deep.equal({
      PORT: 1,
      MANAGEMENT_PORT: 3004,
      MOUNT_POINT: '/qwe',
      APP_CONF_DIR: '/qweqwe',
      NEW_RELIC_ENABLED: 3,
      NEW_RELIC_NO_CONFIG_FILE: 4,
      NEW_RELIC_LOG: 'qweqwe'
    });
  });

  it('should be a noop if NODE_ENV is set to \'production\'', () => {
    const env = {};
    envAugmentor.setup(runModeStub(true), clusterStub(true), env);

    expect(env).to.deep.equal({});
  });

  it('should write to stdout injected defaults for env in dev mode', () => {
    const env = {PORT: 8000, MANAGEMENT_PORT: 8004};
    envAugmentor.setup(runModeStub(false), clusterStub(true), env);

    expect(stdout).to.be.string(`DEV mode detected and required env variables are missing, pre-loading stub values: ` +
      JSON.stringify({
        MOUNT_POINT: '',
        APP_CONF_DIR: './test/configs',
        NEW_RELIC_ENABLED: false,
        NEW_RELIC_NO_CONFIG_FILE: true,
        NEW_RELIC_LOG: 'stdout'
      }));
  });

  it('should only write to stdount injected values in dev mode if there were injected any', () => {
    const env = {
      PORT: 8000,
      MOUNT_POINT: '',
      MANAGEMENT_PORT: 8004,
      APP_CONF_DIR: './',
      NEW_RELIC_ENABLED: false,
      NEW_RELIC_NO_CONFIG_FILE: true,
      NEW_RELIC_LOG: 'stdout'
    };

    envAugmentor.setup(runModeStub(false), clusterStub(true), env);
    expect(stdout).to.not.be.string(`DEV mode detected and required env variables are missing`);
  });


  it('should write to stdout injected defaults for env in dev mode', () => {
    const env = {PORT: 8000, MANAGEMENT_PORT: 8004};
    envAugmentor.setup(runModeStub(false), clusterStub(true), env);

    expect(stdout).to.be.string(`DEV mode detected and required env variables are missing, pre-loading stub values: ` +
      JSON.stringify({
        MOUNT_POINT: '',
        APP_CONF_DIR: './test/configs',
        NEW_RELIC_ENABLED: false,
        NEW_RELIC_NO_CONFIG_FILE: true,
        NEW_RELIC_LOG: 'stdout'
      }));
  });

  it('should not write to stdout injected defaults for env in dev mode for worker processes', () => {
    envAugmentor.setup(runModeStub(false), clusterStub(false), {});
    expect(stdout).to.be.empty;
  });


  function runModeStub(isProduction) {
    return {
      isProduction: () => isProduction
    };
  }

  function clusterStub(isMaster) {
    return {isMaster};
  }

});