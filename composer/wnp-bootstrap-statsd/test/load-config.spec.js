'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  load = require('../lib/load-config'),
  sinon = require('sinon'),
  runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wnp-bootstrap-statsd');

describe('load config', () => {
  const config = {json: () => {}};

  it('should load config from environment variables if present', sinon.test(function() {
    const env = {WIX_BOOTSTRAP_STATSD_HOST: 'from-env', WIX_BOOTSTRAP_STATSD_INTERVAL: 1000};
    const logDebug = this.spy(log, 'debug');

    expect(load(env, config, log, runMode)).to.deep.equal({host: 'from-env', interval: 1000});

    expect(logDebug).to.have.been.calledWith(sinon.match('env variables \'WIX_BOOTSTRAP_STATSD_HOST\' and \'WIX_BOOTSTRAP_STATSD_INTERVAL\' set'));
  }));

  it('should return defaults in dev environment and given env variables are not set', sinon.test(function() {
    const logDebug = this.spy(log, 'debug');
    this.stub(runMode, 'isProduction').returns(false);

    expect(load({}, config, log, runMode)).to.deep.equal({host: 'localhost', interval: 5000});

    expect(logDebug).to.have.been.calledWith(sinon.match('dev mode detected'));
  }));

  it('should load config file in production mode if environment variables are missing', sinon.test(function() {
    const logDebug = this.spy(log, 'debug');
    const loadJson = this.stub(config, 'json').returns({statsd: {host: 'from-config', interval: 200}});
    this.stub(runMode, 'isProduction').returns(true);

    expect(load({}, config, log, runMode)).to.deep.equal({host: 'from-config', interval: 200});

    expect(loadJson).to.have.been.calledWith('wnp-bootstrap-statsd');
    expect(logDebug).to.have.been.calledWith(sinon.match('production mode detected'));
  }));
});