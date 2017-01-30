'use strict';
const expect = require('chai').expect,
  buildContext = require('../../lib/context/initial-app-context'),
  join = require('path').join;

describe('app-context', () => {
  const env = {
    PORT: '3000',
    MANAGEMENT_PORT: '3004',
    MOUNT_POINT: '',
    APP_CONF_DIR: './test/context/configs',
    APP_TEMPL_DIR: './templates',
    APP_LOG_DIR: './target/logs',
    HOSTNAME: 'localhost',
    NEW_RELIC_ENABLED: false,
    NEW_RELIC_NO_CONFIG_FILE: true,
    NEW_RELIC_LOG: 'stdout'
  };

  before(() => {
    process.env.NEW_RELIC_ENABLED = false;
    process.env.NEW_RELIC_NO_CONFIG_FILE = true;
    process.env.NEW_RELIC_LOG = 'stdout';
  });

  it('should load environment', () => {
    const ctx = buildContext(env);
    expect(ctx.env).to.deep.equal(env);
  });

  it('should loads load app name and version', () => {
    const packageJson = require(join(process.cwd(), 'package.json'));
    const ctx = buildContext(env);
    expect(ctx.app).to.contain.deep.property('name', packageJson.name);
    expect(ctx.app).to.contain.deep.property('version');
  });

  it('should load and configure metrics module', () => {
    const ctx = buildContext(env);
    const collector = new CollectingReporter();

    ctx.metrics.factory.addReporter(collector);
    ctx.metrics.client.meter('aMeter')(10);

    expect(collector.meters('tag=METER.meter=aMeter')).to.not.be.empty;
  });

  class CollectingReporter {
    constructor() {
      this._packageJson = require(join(process.cwd(), 'package.json'));
    }

    addTo(metrics) {
      this._metrics = metrics;
    }

    meters(name) {
      const fullName = [`root=node_app_info.host=localhost.app_name=${this._packageJson.name}`, name].join('.');
      return Object.keys(this._metrics.meters).filter(key => key.indexOf(fullName) > -1);
    }
  }

});
