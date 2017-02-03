const expect = require('chai').expect,
  appContext = require('../../lib/context/bootstrap-app-context'),
  join = require('path').join,
  Logger = require('wnp-debug').Logger,
  ShutdownAssmebler = require('../../lib/shutdown').Assembler,
  HealthManager = require('../../lib/health/manager'),
  sinon = require('sinon');

describe('bootstrap-app-context', () => {
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

  before(() => Object.keys(env).forEach(key => process.env[key] = env[key]));
  after(() => Object.keys(env).forEach(key => delete process.env[key]));

  it('loads environment', () => {
    const {buildContext} = buildContextMocks();
    const context = buildContext(env);

    expect(context.env).to.deep.equal(env);
  });

  it('loads config loader bound to APP_CONF_DIR', () => {
    const {buildContext} = buildContextMocks();
    const context = buildContext(env);
    
    expect(context.config.json('test-config')).to.deep.equal({configKey: 'configValue'});
  });
  
  it('loads app name and version', () => {
    const {buildContext} = buildContextMocks();
    const packageJson = require(join(process.cwd(), 'package.json'));
    const context = buildContext(env);
    
    expect(context.app).to.contain.deep.property('name', packageJson.name);
    expect(context.app).to.contain.deep.property('version');
  });

  it('loads and configures metrics module', () => {
    const {buildContext} = buildContextMocks();
    const context = buildContext(env);
    const collector = new CollectingReporter();

    context.metrics.factory.addReporter(collector);
    context.metrics.client.meter('aMeter')(10);

    expect(collector.meters('tag=METER.meter=aMeter')).to.not.be.empty;
  });

  it('loads newrelic', () => {
    const {buildContext} = buildContextMocks();
    const context = buildContext(env);

    expect(context.newrelic).to.not.be.undefined;
  });

  it('adds forward to add shutdown hooks on shutdown assembler', () => {
    const {shutdownAssembler, buildContext} = buildContextMocks();
    const fn = sinon.stub();
    
    buildContext(env).management.addShutdownHook('aName', fn);

    expect(shutdownAssembler.addFunction).to.have.been.calledWith('aName', fn);
  });

  it('adds forward to health manager to add health tests', () => {
    const {healthManager, buildContext} = buildContextMocks();
    const fn = sinon.stub();

    buildContext(env).management.addHealthTest('aName', fn);

    expect(healthManager.add).to.have.been.calledWith('aName', fn);
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

  function buildContextMocks() {
    const log = sinon.createStubInstance(Logger);
    const shutdownAssembler = sinon.createStubInstance(ShutdownAssmebler);
    const healthManager = sinon.createStubInstance(HealthManager);
    const buildContext = env => appContext({env, log, shutdownAssembler, healthManager});

    return {log, buildContext, shutdownAssembler, healthManager};
  }
});
