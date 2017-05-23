const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  wixRpcClientSupport = require('wix-rpc-client-support'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  bootstrapRpc = require('..'),
  Logger = require('wnp-debug').Logger,
  WixConfig = require('wix-config'),
  shelljs = require('shelljs'),
  statsdTestkit = require('wix-statsd-testkit'),
  emitter = require('wix-config-emitter'),
  eventually = require('wix-eventually'),
  WixMeasuredFactory = require('wix-measured'),
  WixStatsdAdapter = require('wix-measured-statsd-adapter'),
  StatsD = require('node-statsd');

describe('wnp bootstrap rpc', function () {
  this.timeout(60000);

  const someUuid = '63b3d6a7-c44d-43d6-ac1a-2d8c6ac48477';
  
  const env = {
    RPC_SERVER_PORT: 3310,
    APP_CONF_DIR: './target/configs'
  };

  jvmTestkit.server({
    artifact: {
      groupId: 'com.wixpress.node',
      artifactId: 'wix-spjs-test-server',
      version: '1.0.0-SNAPSHOT'
    },
    port: env.RPC_SERVER_PORT
  }).beforeAndAfter();

  const statsd = statsdTestkit.server().beforeAndAfter();

  it('loads rpc signing key from config (invalid key in config does not match of that in test server)', done => {
    const environment = Object.assign({}, env, {NODE_ENV: 'production'});

    emitConfigWith(environment, 'isNotValid___')
      .then(() => rpcFactoryWithCollaborators(environment))
      .then(({rpcClientFor}) => rpcClientFor('Contract').invoke('hello', someUuid))
      .catch(e => {
        expect(e.message).to.be.string('Status: 400');
        done();
      });
  });

  it('loads rpc signing key from config', () => {
    const environment = Object.assign({}, env, {NODE_ENV: 'production'});

    return emitConfigWith(environment, wixRpcClientSupport.devSigningKey)
      .then(() => rpcFactoryWithCollaborators(environment))
      .then(({log, rpcClientFor}) => {
        expect(log.debug).to.have.been.calledWithMatch('production');
        return rpcClientFor('Contract').invoke('hello', someUuid);
      });
  });

  it('returns an rpc client with wix support', () => {
    const {rpcClientFor, hostname, artifactInfo} = rpcFactoryWithCollaborators(env);

    return rpcClientFor('Aspects')
      .invoke('callerId')
      .then(res => {
        expect(res).to.contain.property('groupId', artifactInfo.namespace);
        expect(res).to.contain.property('artifactId', artifactInfo.name);
        expect(res).to.contain.property('host', hostname);
      });
  });

  it('respects provided timeout', done => {
    const {rpcClientFor} = rpcFactoryWithCollaborators(env, 200);
    const beforeCall = Date.now();
    
    rpcClientFor('NonFunctional')
      .invoke('duration', 1000)
      .catch(e => {
        expect(Date.now() - beforeCall).to.be.within(100, 300);
        expect(e.message).to.be.string('network timeout');
        done();
      });
  });
  
  it('reports metrics', () => {
    const {rpcClientFor} = rpcFactoryWithCollaborators(env);
    return rpcClientFor('Contract')
      .invoke('hello', someUuid)
      .then(() => eventually(() => {
        expect(statsd.events('RPC_CLIENT')).not.to.be.empty;
      }));
  });

  function emitConfigWith(env, signingKey) {
    shelljs.rm('-rf', env.APP_CONF_DIR);
    return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .val('rpc_signing_password', signingKey)
      .emit();
  }

  function rpcFactoryWithCollaborators(env, timeout) {
    const log = sinon.createStubInstance(Logger);
    const artifactInfo = {name: 'me', namespace: 'my'};
    const hostname = 'local.dev';
    const config = new WixConfig(env.APP_CONF_DIR);
    const statsdAdapter = new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval: 10});
    const wixMeasuredFactory = new WixMeasuredFactory('localhost', 'my-app').addReporter(statsdAdapter);
    const rpcFactory = bootstrapRpc({env, log, timeout, artifactInfo, hostname, config, wixMeasuredFactory});
    const rpcClientFor = serviceName => rpcFactory
      .clientFactory(`http://localhost:${env.RPC_SERVER_PORT}`, serviceName)
      .client({});
    return {rpcClientFor, log, artifactInfo, hostname};
  }
});
