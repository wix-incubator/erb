'use strict';
const expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  rpcClientSupport = require('wix-rpc-client-support'),
  testkit = require('wnp-composer-testkit'),
  http = require('wnp-http-test-client'),
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
    const env = {
      RPC_SERVER_PORT: rpcServerPort,
      NODE_ENV: 'development',
      APP_CONF_DIR: './non-existent'
    };
    const app = testkit.server('./test/app', {env: env}).beforeAndAfter();

    it('should decrypt session using dev key', () =>
      http.okGet(app.getUrl('/rpc/req-context'), opts)
        .then(res => expect(res.json().requestId).to.equal(opts.headers['x-wix-request-id']))
        .then(() => expect(app.stdout()).to.be.string('dev mode detected, using rpc signing key'))
    );
  });

  describe('production mode with config', () => {
    const env = {
      NODE_ENV: 'production',
      APP_CONF_DIR: './target/configs',
      RPC_SERVER_PORT: rpcServerPort,
      'WIX-BOOT-SESSION-MAIN-KEY': '1234211331224111',
      'WIX-BOOT-EXPRESS-SEEN-BY': 'seen-by-env'
    };
    const app = testkit.server('./test/app', {env: env});

    before(() => {
      shelljs.rm('-rf', env.APP_CONF_DIR);
      return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
        .val('rpc_signing_password', rpcClientSupport.devSigningKey)
        .emit().then(() => app.start());
    });

    after(() => app.stop());

    it('should decrypt session using key from config', () =>
      http.okGet(app.getUrl('/rpc/req-context'), opts)
        .then(res => expect(res.json().requestId).to.equal(opts.headers['x-wix-request-id']))
        .then(() => expect(app.stdout()).to.be.string('production mode detected, loading rpc signing key from config'))
    );
  });

  describe('production mode with env overrides', () => {
    const env = {
      NODE_ENV: 'production',
      APP_CONF_DIR: './non-existent',
      RPC_SERVER_PORT: rpcServerPort,
      'WIX-BOOT-SESSION-MAIN-KEY': '1234211331224111',
      'WIX-BOOT-EXPRESS-SEEN-BY': 'seen-by-env',
      'WIX-BOOT-RPC-SIGNING-KEY': '1234567890'
    };
    const app = testkit.server('./test/app', {env: env}).beforeAndAfter();

    it('should decrypt session using key from provided env variables', () =>
      http.okGet(app.getUrl('/rpc/req-context'), opts)
        .then(res => expect(res.json().requestId).to.equal(opts.headers['x-wix-request-id']))
        .then(() => expect(app.stdout()).to.be.string('production mode detected, env variable \'WIX-BOOT-RPC-SIGNING-KEY\' set, skipping loading from config.'))
    );
  });
});