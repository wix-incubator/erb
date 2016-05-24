'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  sinonJs = require('sinon'),
  newRelic = require('../../lib/before-all/new-relic'),
  runMode = require('wix-run-mode'),
  log = require('wnp-debug')('test');

describe('new-relic', () => {
  let sinon, match = sinonJs.match;

  beforeEach(() => sinon = sinonJs.sandbox.create());
  afterEach(() => sinon.verifyAndRestore());

  it('should add environment variables to disable new relic in dev mode', () => {
    sinon.stub(runMode, 'isProduction').returns(false);
    const debug = sinon.spy(log, 'debug');
    const newRelicFn = sinon.spy();
    const env = {};

    newRelic(runMode, env, log, newRelicFn);

    expect(env).to.deep.equal({
      NEW_RELIC_ENABLED: false,
      NEW_RELIC_NO_CONFIG_FILE: true,
      NEW_RELIC_LOG: 'stdout'
    });

    expect(debug).calledWithMatch(match('DEV mode detected, disabling new relic by setting env variables'));
    expect(newRelicFn).calledOnce;
  });

  it('should be a noop for production mode', () => {
    sinon.stub(runMode, 'isProduction').returns(true);
    const debug = sinon.spy(log, 'debug');
    const newRelicFn = sinon.spy();
    const env = {};

    newRelic(runMode, env, log, newRelicFn);

    expect(env).to.deep.equal({});

    expect(debug).callCount(0);
    expect(newRelicFn).calledOnce;
  });

});