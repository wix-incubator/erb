const expect = require('chai').expect,
  appContext = require('../../lib/context/bootstrap-app-context'),
  join = require('path').join,
  Logger = require('wnp-debug').Logger,
  ShutdownAssmebler = require('../../lib/shutdown').Assembler,
  HealthManager = require('../../lib/health/manager'),
  sinon = require('sinon'),
  sessionTestkit = require('wix-session-crypto-testkit').v2,
  rpcTestkit = require('wix-rpc-testkit');

describe('bootstrap-app-context', () => {
  const newRelicDisables = {
    NEW_RELIC_ENABLED: false,
    NEW_RELIC_NO_CONFIG_FILE: true,
    NEW_RELIC_LOG: 'stdout'    
  };
  
  before(() => Object.keys(newRelicDisables).forEach(key => process.env[key] = newRelicDisables[key]));
  after(() => Object.keys(newRelicDisables).forEach(key => delete process.env[key]));

  it('loads environment', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const context = buildContext(env);

    expect(context.env).to.deep.equal(env);
  });

  it('loads config loader bound to APP_CONF_DIR', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const context = buildContext(env);
    
    expect(context.config.json('test-config')).to.deep.equal({configKey: 'configValue'});
  });
  
  it('loads app name and version', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const packageJson = require(join(process.cwd(), 'package.json'));
    const context = buildContext(env);
    
    expect(context.app).to.contain.deep.property('name', packageJson.name);
    expect(context.app).to.contain.deep.property('version');
  });

  //TODO: maybe test if injected types are correct?
  it('loads and configures metrics module', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const context = buildContext(env);
    const collector = new CollectingReporter();

    context.metrics.factory.addReporter(collector);
    context.metrics.client.meter('aMeter')(10);

    expect(collector.meters('tag=METER.meter=aMeter')).to.not.be.empty;
  });

  it('loads newrelic', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const context = buildContext(env);

    expect(context.newrelic).to.not.be.undefined;
  });

  //TODO: maybe test if injected types are correct?
  it('loads session', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const bundle = sessionTestkit.aValidBundle();
    const context = buildContext(env);

    expect(context.session.v2.decrypt(bundle.token)).to.deep.equal(bundle.session);
  });

  it('adds statsd with effective statsd configuration', () => {
    const env = environment({'WIX_BOOT_STATSD_HOST': 'local', 'WIX_BOOT_STATSD_INTERVAL': 12});
    const {buildContext} = buildContextMocks();
    const context = buildContext(env);
    
    expect(context.statsd).to.deep.equal({host: 'local', interval: 12});
  });
  
  it('adds forward to add shutdown hooks on shutdown assembler', () => {
    const env = environment();
    const {shutdownAssembler, buildContext} = buildContextMocks();
    const fn = sinon.stub();
    
    buildContext(env).management.addShutdownHook('aName', fn);

    expect(shutdownAssembler.addFunction).to.have.been.calledWith('aName', fn);
  });

  it('adds forward to health manager to add health tests', () => {
    const env = environment();
    const {healthManager, buildContext} = buildContextMocks();
    const fn = sinon.stub();

    buildContext(env).management.addHealthTest('aName', fn);

    expect(healthManager.add).to.have.been.calledWith('aName', fn);
  });

  describe('rpc', () => {
    const testkit = rpcTestkit.server().beforeAndAfter();
    testkit.when('TestService', 'testMethod').respond((params, headers) => { return {params, headers}});
    
    it('provides rpc client on context', () => {
      const env = environment();
      const {buildContext} = buildContextMocks();

      return buildContext(env).rpc.clientFactory(testkit.getUrl('TestService')).client({})
        .invoke('testMethod', 'a')
        .then(res => expect(res.params[0]).to.equal('a'));
    });
    
    it('forwards hostname, appName to rpc module for callerId header', () => {
      const env = environment({});
      const {buildContext} = buildContextMocks();

      return buildContext(env).rpc.clientFactory(testkit.getUrl('TestService')).client({})
        .invoke('testMethod', 'a')
        .then(res => expect(res.headers).to.contain.property('x-wix-rpc-caller-id', 'wnp-bootstrap-composer@localhost'));
    });
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
    const composerOptions = sinon.spy();
    const buildContext = env => appContext({env, log, shutdownAssembler, healthManager, composerOptions});

    return {log, buildContext, shutdownAssembler, healthManager, composerOptions};
  }
  
  function environment(additionalEnv) {
    return Object.assign({}, newRelicDisables, {
      PORT: '3000',
      MANAGEMENT_PORT: '3004',
      MOUNT_POINT: '',
      APP_CONF_DIR: './test/context/configs',
      APP_TEMPL_DIR: './templates',
      APP_LOG_DIR: './target/logs',
      HOSTNAME: 'localhost',
    }, additionalEnv);
  }
  
});
