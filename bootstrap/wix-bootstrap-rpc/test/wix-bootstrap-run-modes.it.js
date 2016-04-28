'use strict';
const fetch = require('node-fetch'),
  expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  rpcClientSupport = require('wix-rpc-client-support'),
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  shelljs = require('shelljs'),
  emitter = require('wix-config-emitter');

describe('wix bootstrap rpc run modes', function () {
  this.timeout(60000);
  const rpcServerPort = 3310;
  const opts = reqOptions.builder().options();

  jvmTestkit.server({
    artifact: {
      groupId: 'com.wixpress.node',
      artifactId: 'wix-rpc-server',
      version: '1.0.0-SNAPSHOT'
    },
    port: rpcServerPort
  }).beforeAndAfter();

  describe('development mode', () => {
    const env = envSupport.bootstrap({
      RPC_SERVER_PORT: rpcServerPort,
      NODE_ENV: 'development',
      APP_CONF_DIR: './non-existent'
    });
    const app = testkit
      .server('./test/app', {env: env}, testkit.checks.httpGet('/health/is_alive'))
      .beforeAndAfter();

    it('should decrypt session using dev key', () =>
      aJsonGet('/rpc/req-context', opts, env)
        .then(res => expect(res.json.requestId).to.equal(opts.headers['x-wix-request-id']))
        .then(() => expect(app.stdout().join()).to.be.string('dev mode detected, using rpc signing key'))
    );
  });

  describe('production mode with config', () => {
    const env = envSupport.bootstrap({
      NODE_ENV: 'production',
      APP_CONF_DIR: './target/configs',
      RPC_SERVER_PORT: rpcServerPort,
      'WIX-BOOT-SESSION-MAIN-KEY': '1234211331224111',
      'WIX-BOOT-EXPRESS-SEEN-BY': 'seen-by-env'
    });
    const app = testkit
      .server('./test/app', {env: env}, testkit.checks.httpGet('/health/is_alive'));

    before(() => {
      shelljs.rm('-rf', env.APP_CONF_DIR);
      return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
        .val('rpc_signing_password', rpcClientSupport.devSigningKey)
        .emit().then(() => app.start());
    });

    after(() => app.stop());

    it('should decrypt session using key from config', () =>
      aJsonGet('/rpc/req-context', opts, env)
        .then(res => expect(res.json.requestId).to.equal(opts.headers['x-wix-request-id']))
        .then(() => expect(app.stdout().join()).to.be.string('production mode detected, loading rpc signing key from config'))
    );
  });

  describe('production mode with env overrides', () => {
    const env = envSupport.bootstrap({
      NODE_ENV: 'production',
      APP_CONF_DIR: './non-existent',
      RPC_SERVER_PORT: rpcServerPort,
      'WIX-BOOT-SESSION-MAIN-KEY': '1234211331224111',
      'WIX-BOOT-EXPRESS-SEEN-BY': 'seen-by-env',
      'WIX-BOOT-RPC-SIGNING-KEY': '1234567890'
    });
    const app = testkit
      .server('./test/app', {env: env}, testkit.checks.httpGet('/health/is_alive'))
      .beforeAndAfterEach();

    it('should decrypt session using key from provided env variables', () =>
      aJsonGet('/rpc/req-context', opts, env)
        .then(res => expect(res.json.requestId).to.equal(opts.headers['x-wix-request-id']))
        .then(() => expect(app.stdout().join()).to.be.string('production mode detected, env variable \'WIX-BOOT-RPC-SIGNING-KEY\' set, skipping loading from config.'))
    );
  });

  function aJsonGet(path, options, env) {
    return fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}${path}`, options)
      .then(res => {
        expect(res.status).to.equal(200);
        return res.json().then(json => {
          res.json = json;
          return res;
        });
      });
  }

// });
});