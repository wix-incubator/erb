'use strict';
const expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  rpcClientSupport = require('wix-rpc-client-support'),
  testkit = require('wnp-bootstrap-composer-testkit'),
  http = require('wnp-http-test-client'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  shelljs = require('shelljs'),
  emitter = require('wix-config-emitter'),
  sessionCrypto = require('wix-session-crypto');

describe('wix bootstrap rpc run modes', function () {
  this.timeout(60000);
  const rpcServerPort = 3310;
  const opts = reqOptions.builder().options();

  jvmTestkit.server({
    artifact: {
      groupId: 'com.wixpress.node',
      artifactId: 'wix-spjs-test-server',
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
        .then(() => expect(app.output).to.be.string('dev mode detected, using rpc signing key'))
    );
  });

  describe('production mode with config', () => {
    const env = {
      NODE_ENV: 'production',
      APP_CONF_DIR: './target/configs',
      RPC_SERVER_PORT: rpcServerPort,
      WIX_BOOT_SESSION_KEY: sessionCrypto.v1.devKey,
      WIX_BOOT_SESSION2_KEY: sessionCrypto.v2.devKey,
      WIX_BOOT_EXPRESS_SEEN_BY: 'seen-by-env',
      WIX_BOOT_STATSD_HOST: 'localhost'
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
        .then(() => expect(app.output).to.be.string('production mode detected, loading rpc signing key from config'))
    );
  });

  describe('production mode with env overrides', () => {
    const env = {
      NODE_ENV: 'production',
      APP_CONF_DIR: './non-existent',
      RPC_SERVER_PORT: rpcServerPort,
      WIX_BOOT_SESSION_KEY: sessionCrypto.v1.devKey,
      WIX_BOOT_SESSION2_KEY: sessionCrypto.v2.devKey,
      WIX_BOOT_EXPRESS_SEEN_BY: 'seen-by-env',
      WIX_BOOT_STATSD_HOST: 'localhost',
      WIX_BOOT_RPC_SIGNING_KEY: rpcClientSupport.devSigningKey
    };
    const app = testkit.server('./test/app', {env: env}).beforeAndAfter();

    it('should decrypt session using key from provided env variables', () =>
      http.okGet(app.getUrl('/rpc/req-context'), opts)
        .then(res => expect(res.json().requestId).to.equal(opts.headers['x-wix-request-id']))
        .then(() => expect(app.output).to.be.string('skipping loading from config'))
    );
  });

  describe('dev mode with env overrides', () => {
    const env = {
      NODE_ENV: 'dev',
      APP_CONF_DIR: './non-existent',
      RPC_SERVER_PORT: rpcServerPort,
      WIX_BOOT_SESSION_KEY: sessionCrypto.v1.devKey,
      WIX_BOOT_SESSION2_KEY: sessionCrypto.v2.devKey,
      WIX_BOOT_EXPRESS_SEEN_BY: 'seen-by-env',
      WIX_BOOT_RPC_SIGNING_KEY: rpcClientSupport.devSigningKey
    };
    const app = testkit.server('./test/app', {env: env}).beforeAndAfter();

    it('should decrypt session using key from provided env variables', () =>
      http.okGet(app.getUrl('/rpc/req-context'), opts)
        .then(res => expect(res.json().requestId).to.equal(opts.headers['x-wix-request-id']))
        .then(() => expect(app.output).to.be.string('skipping loading from config'))
    );
  });

});
