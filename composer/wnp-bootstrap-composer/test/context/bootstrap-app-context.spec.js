const expect = require('chai').expect,
  appContext = require('../../lib/context/bootstrap-app-context'),
  join = require('path').join,  
  Logger = require('wnp-debug').Logger,
  PetriSpecsComposer = require('wnp-bootstrap-petri-specs'),
  sinon = require('sinon'),
  sessionTestkit = require('wix-session-crypto-testkit').v2,
  rpcTestkit = require('wix-rpc-testkit'),
  CollectingReporter = require('../support/collecting-reporter');

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
    const {appContext} = buildContext(env);

    expect(appContext.env).to.deep.equal(env);
  });

  it('loads config loader bound to APP_CONF_DIR', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const {appContext} = buildContext(env);
    
    expect(appContext.config.json('test-config')).to.deep.equal({configKey: 'configValue'});
  });
  
  it('loads app name and version', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const packageJson = require(join(process.cwd(), 'package.json'));
    const {appContext} = buildContext(env);
    
    expect(appContext.app).to.contain.deep.property('name', packageJson.name);
    expect(appContext.app).to.contain.deep.property('version');
  });

  //TODO: maybe test if injected types are correct?
  it('loads and configures metrics module', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const {appContext} = buildContext(env);
    const collector = new CollectingReporter();

    appContext.metrics.factory.addReporter(collector);
    appContext.metrics.client.meter('aMeter')(10);

    expect(collector.meters('tag=METER.meter=aMeter')).to.not.be.empty;
  });

  it('loads newrelic', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const {appContext} = buildContext(env);

    expect(appContext.newrelic).to.not.be.undefined;
  });

  //TODO: maybe test if injected types are correct?
  it('loads session', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const bundle = sessionTestkit.aValidBundle();
    const {appContext} = buildContext(env);

    expect(appContext.session.v2.decrypt(bundle.token)).to.deep.equal(bundle.session);
  });

  it('adds statsd with effective statsd configuration for cluster configuration', () => {
    const env = environment({'WIX_BOOT_STATSD_HOST': 'local', 'WIX_BOOT_STATSD_INTERVAL': 12});
    const {buildContext} = buildContextMocks();
    const {appContext} = buildContext(env);
    
    expect(appContext.statsd).to.deep.equal({host: 'local', interval: 12});
  });
  
  it('adds forward to add shutdown hooks on shutdown assembler', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const fn = sinon.stub();
    
    const {appContext, shutdownAssembler} = buildContext(env);

    appContext.management.addShutdownHook('aName', fn);
    
    return shutdownAssembler.emit()().then(() => {
      expect(fn).to.have.been.calledOnce;  
    });
  });

  it('adds forward to health manager to add health tests', () => {
    const env = environment();
    const {buildContext} = buildContextMocks();
    const fn = sinon.stub();

    const {appContext, healthManager} = buildContext(env);

    appContext.management.addHealthTest('aName', fn);

    healthManager.start().then(() => {
      expect(fn).to.have.been.calledOnce;
    });
  });

  describe('rpc', () => {
    const testkit = rpcTestkit.server().beforeAndAfter();
    testkit.when('TestService', 'testMethod').respond((params, headers) => { return {params, headers}});
    
    it('provides rpc client on context', () => {
      const env = environment();
      const {buildContext} = buildContextMocks();

      const {appContext} = buildContext(env); 
      
      return appContext.rpc.clientFactory(testkit.getUrl('TestService')).client({})
        .invoke('testMethod', 'a')
        .then(res => expect(res.params[0]).to.equal('a'));
    });
    
    it('forwards hostname, appName to rpc module for callerId header', () => {
      const env = environment({});
      const {buildContext} = buildContextMocks();

      const {appContext} = buildContext(env);
      
      return appContext.rpc.clientFactory(testkit.getUrl('TestService')).client({})
        .invoke('testMethod', 'a')
        .then(res => expect(res.headers).to.contain.property('x-wix-rpc-caller-id', 'wnp-bootstrap-composer@localhost'));
    });
  });
  
  it('adds petri client', () => {
    const env = environment({});
    const {buildContext} = buildContextMocks();

    const {appContext} = buildContext(env);    
    
    return appContext.petri.client({})
      .conductExperiment('testMethod', 'fallback')
      .then(res => expect(res).to.equal('fallback'));
  });
  
  function buildContextMocks() {
    const log = sinon.createStubInstance(Logger);
    const petriSpecsComposer = sinon.createStubInstance(PetriSpecsComposer);
    const composerOptions = sinon.spy();
    const buildContext = env => appContext({
      env, 
      log, 
      petriSpecsComposer, 
      composerOptions
    });

    return {log, buildContext, composerOptions};
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
