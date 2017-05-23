const expect = require('chai').expect,
  bootstrapRpc = require('wnp-bootstrap-rpc'),
  petriTestkit = require('wix-petri-testkit'),
  WixConfig = require('wix-config'),
  sinon = require('sinon'),
  Logger = require('wnp-debug').Logger,
  rpcClientSupport = require('wix-rpc-client-support'),
  bootstrapPetri = require('..'),
  shelljs = require('shelljs'),
  emitter = require('wix-config-emitter'),
  WixMeasuredFactory = require('wix-measured');

describe('wnp-bootstrap-petri', function () {
  const env = {
    WIX_BOOT_RPC_SIGNING_KEY: rpcClientSupport.devSigningKey,
    APP_CONF_DIR: './target/configs'
  };
  const petriServer = petriTestkit.server({port: 3011}).beforeAndAfterEach();

  it('should load configuration from config file in production mode and conduct an experiment', () => {
    petriServer.onConductExperiment(() => 'true');

    return emitConfig()
      .then(() => loadConfigurationMocks(Object.assign({}, env, {NODE_ENV: 'production'})).petriClient)
      .then(petriClient => petriClient.conductExperiment('aFT'));
  });

  it('should provide a petri client', () => {
    petriServer.onConductExperiment(() => 'false');
    const {petriClient} = loadConfigurationMocks(
      Object.assign({}, env, {WIX_BOOT_LABORATORY_URL: `http://localhost:${petriServer.getPort()}`}));

    return petriClient.conductExperiment('aFT')
      .then(res => expect(res).to.equal('false'));
  });

  function loadConfigurationMocks(env) {
    const config = new WixConfig(env.APP_CONF_DIR);
    const log = sinon.createStubInstance(Logger);
    const rpcFactory = bootstrapRpc({
      env, 
      config, 
      log, 
      hostname: 'local', 
      artifactInfo: {name: 'dev', namespace: 'my'}, 
      wixMeasuredFactory: new WixMeasuredFactory('some-host', 'some-app-name')});
    const petriClient = bootstrapPetri({env, config, log, rpcFactory}).client({});

    return {config, log, petriClient};
  }

  function emitConfig() {
    shelljs.rm('-rf', env.APP_CONF_DIR);
    return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .fn('service_url', 'com.wixpress.common.wix-laboratory-server', `http://localhost:${petriServer.getPort()}`)
      .emit();
  }
});
