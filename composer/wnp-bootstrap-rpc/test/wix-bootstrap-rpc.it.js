const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  wixRpcClientSupport = require('wix-rpc-client-support'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  bootstrapRpc = require('..'),
  Logger = require('wnp-debug').Logger,
  WixConfig = require('wix-config'),
  shelljs = require('shelljs'),
  emitter = require('wix-config-emitter');

describe('wnp bootstrap rpc', function () {
  this.timeout(60000);
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

  it('loads rpc signing key from config (invalid key in config does not match of that in test server)', done => {
    const environment = Object.assign({}, env, {NODE_ENV: 'production'});

    emitConfigWith(environment, 'isNotValid___')
      .then(() => rpcFactoryWithCollaborators(environment))
      .then(({rpcClientFor}) => rpcClientFor('Contract').invoke('hello', '63b3d6a7-c44d-43d6-ac1a-2d8c6ac48477'))
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
        return rpcClientFor('Contract').invoke('hello', '63b3d6a7-c44d-43d6-ac1a-2d8c6ac48477');
      });
  });

  it('returns rpc caller id from remote server', () => {
    const {rpcClientFor, hostname, artifactName} = rpcFactoryWithCollaborators(env);

    return rpcClientFor('Aspects')
      .invoke('callerId')
      .then(res => {
        expect(res).to.contain.property('artifactId', artifactName);
        expect(res).to.contain.property('host', hostname);
      });
  });

  it('respects provided timeout', done => {
    const {rpcClientFor} = rpcFactoryWithCollaborators(env, 200);

    rpcClientFor('NonFunctional')
      .invoke('duration', 1000)
      .catch(e => {
        expect(e.message).to.be.string('network timeout');
        done();
      });
  });

  function emitConfigWith(env, signingKey) {
    shelljs.rm('-rf', env.APP_CONF_DIR);
    return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .val('rpc_signing_password', signingKey)
      .emit();
  }

  function rpcFactoryWithCollaborators(env, timeout) {
    const log = sinon.createStubInstance(Logger);
    const artifactName = 'me';
    const hostname = 'local.dev';
    const config = new WixConfig(env.APP_CONF_DIR);
    const rpcFactory = bootstrapRpc({env, log, timeout, artifactName, hostname, config});
    const rpcClientFor = serviceName => rpcFactory
      .clientFactory(`http://localhost:${env.RPC_SERVER_PORT}`, serviceName)
      .client({});


    return {rpcClientFor, log, artifactName, hostname};
  }
});
