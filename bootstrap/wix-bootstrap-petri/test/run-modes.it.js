const expect = require('chai').expect,
  testkit = require('wix-bootstrap-testkit'),
  http = require('wnp-http-test-client'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  emitter = require('wix-config-emitter'),
  sessionCrypto = require('wix-session-crypto'),
  rpcSupport = require('wix-rpc-client-support');

describe('wix bootstrap petri run modes', function () {
  this.timeout(120000);

  describe('development mode', () => {
    const env = {
      NODE_ENV: 'development',
      APP_CONF_DIR: './non-existent'
    };

    const app = withBeforeAndAfter(anApp(env), laboratoryServer(3020));

    it('expect laboratory server on localhost:3020', () =>
      http.okGet(app.getUrl('/conduct/experiment/does-not-matter?fallback=false'))
        .then(() => expect(app.output).to.be.string('using default laboratory url for dev environment'))
    );
  });

  describe('production mode with config', () => {
    const port = 3050;
    const env = {
      NODE_ENV: 'production',
      APP_CONF_DIR: './target/configs',
      WIX_BOOT_SESSION_KEY: sessionCrypto.v1.devKey,
      WIX_BOOT_SESSION2_KEY: sessionCrypto.v2.devKey,
      WIX_BOOT_EXPRESS_SEEN_BY: 'seen-by-env',
      WIX_BOOT_STATSD_HOST: 'localhost',
      WIX_BOOT_RPC_SIGNING_KEY: rpcSupport.devSigningKey,
      WIX_BOOT_SEEN_BY: 'test'
    };
    const app = withBeforeAndAfter(anApp(env), laboratoryServer(port), emitConfigWithPort(port, env));

    it('expect laboratory server on url read from config', () =>
      http.okGet(app.getUrl('/conduct/experiment/does-not-matter?fallback=false'))
        .then(() => expect(app.output).to.be.string('production mode detected, loading laboratory'))
    );
  });

  describe('production mode with env overrides', () => {
    const port = 3090;
    const env = {
      NODE_ENV: 'production',
      APP_CONF_DIR: './non-existent',
      WIX_BOOT_SESSION_KEY: sessionCrypto.v1.devKey,
      WIX_BOOT_SESSION2_KEY: sessionCrypto.v2.devKey,
      WIX_BOOT_EXPRESS_SEEN_BY: 'seen-by-env',
      WIX_BOOT_RPC_SIGNING_KEY: rpcSupport.devSigningKey,
      WIX_BOOT_STATSD_HOST: 'localhost',
      WIX_BOOT_LABORATORY_URL: `http://localhost:${port}`,
      WIX_BOOT_SEEN_BY: 'test'
    };
    const app = withBeforeAndAfter(anApp(env), laboratoryServer(port));

    it('expect laboratory server on url read from config', () =>
      http.okGet(app.getUrl('/conduct/experiment/does-not-matter?fallback=false'))
        .then(() => expect(app.output).to.be.string('skipping loading from config'))
    );
  });

  describe('dev mode with env overrides', () => {
    const port = 3090;
    const env = {
      NODE_ENV: 'dev',
      APP_CONF_DIR: './non-existent',
      WIX_BOOT_SESSION_KEY: sessionCrypto.v1.devKey,
      WIX_BOOT_SESSION2_KEY: sessionCrypto.v2.devKey,
      WIX_BOOT_EXPRESS_SEEN_BY: 'seen-by-env',
      WIX_BOOT_RPC_SIGNING_KEY: rpcSupport.devSigningKey,
      WIX_BOOT_LABORATORY_URL: `http://localhost:${port}`
    };
    const app = withBeforeAndAfter(anApp(env), laboratoryServer(port));

    it('expect laboratory server on url read from config', () =>
      http.okGet(app.getUrl('/conduct/experiment/does-not-matter?fallback=false'))
        .then(() => expect(app.output).to.be.string('skipping loading from config'))
    );
  });

  function withBeforeAndAfter(app, laboratoryServer, cfg) {
    before(() => (cfg ? cfg() : Promise.resolve()).then(() => laboratoryServer.start()).then(() => app.start()));
    after(() => laboratoryServer.stop().then(() => app.stop()));
    return app;
  }

  function anApp(env) {
    return testkit.server('./test/app', {env: env})
  }

  function laboratoryServer(port) {
    return jvmTestkit.server({
      artifact: {
        groupId: 'com.wixpress.node',
        artifactId: 'wix-spjs-test-server',
        version: '1.0.0-SNAPSHOT'
      },
      port: port
    });
  }

  function emitConfigWithPort(port, env) {
    return () => emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .fn('service_url', 'com.wixpress.common.wix-laboratory-server', `http://localhost:${port}`)
      .emit();
  }
});
