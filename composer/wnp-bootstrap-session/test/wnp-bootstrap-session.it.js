'use strict';
const expect = require('chai').expect,
  envSupport = require('env-support'),
  testkit = require('wnp-bootstrap-composer-testkit'),
  http = require('wnp-http-test-client'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  emitter = require('wix-config-emitter'),
  shelljs = require('shelljs'),
  NodeRSA = require('node-rsa');

describe('bootstrap session', function() {
  this.timeout(10000);

  describe('development mode', () => {
    const app = anApp({NODE_ENV: 'development'}).beforeAndAfter();

    it('should decrypt wixSession session using dev keys', () => {
      const bundle = sessionTestkit.v1.aValidBundle();
      return http.okGet(app.getUrl(`v1/?token=${bundle.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundle.sessionJson))
        .then(() => expect(app.output()).to.be.string('dev mode detected, using session key'));
    });

    it('should decrypt wixSession2 session using dev keys', () => {
      const bundle = sessionTestkit.v2.aValidBundle();
      return http.okGet(app.getUrl(`v2/?token=${bundle.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundle.sessionJson))
        .then(() => expect(app.output()).to.be.string('dev mode detected, using session key'));
    });

  });

  describe('production mode with config', () => {
    const app = anApp({NODE_ENV: 'production', APP_CONF_DIR: './target/configs'});
    const keys = keyPair();
    const bundleV1 = sessionTestkit.v1.aValidBundle({mainKey: '1234211331224111'});
    const bundleV2 = sessionTestkit.v2.aValidBundle({privateKey: keys.private, publicKey: keys.public});

    before(() => {
      shelljs.rm('-rf', app.env.APP_CONF_DIR);
      return emitter({sourceFolders: ['./templates'], targetFolder: app.env.APP_CONF_DIR})
        .val('crypto_main_key', '1234211331224111')
        .fn('library_passwd', 'new-session-public-key', keys.public)
        .emit().then(() => app.start());
    });

    after(() => app.stop());

    it('should decrypt wixSession-base session using keys from config', () => {
      return http.okGet(app.getUrl(`/v1?token=${bundleV1.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundleV1.sessionJson))
        .then(() => expect(app.output()).to.be.string('production mode detected, loading session keys from config'))
    });

    it('should decrypt wixSession2-base session using keys from config', () => {
      return http.okGet(app.getUrl(`/v2?token=${bundleV2.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundleV2.sessionJson))
        .then(() => expect(app.output()).to.be.string('production mode detected, loading session keys from config'))
    });
  });
  describe('production mode with env overrides', () => {
    const keys = keyPair();
    const bundleV1 = sessionTestkit.v1.aValidBundle({mainKey: '1234211331224111'});
    const bundleV2 = sessionTestkit.v2.aValidBundle({privateKey: keys.private, publicKey: keys.public});

    const env = envSupport.bootstrap({
      NODE_ENV: 'production',
      APP_CONF_DIR: './non-existent',
      'WIX-BOOT-SESSION-KEY': bundleV1.mainKey,
      'WIX-BOOT-SESSION2-KEY': bundleV2.publicKey});
    const app = anApp(env).beforeAndAfter();

    it('should not load config and decrypt wixSession-based session keys from provided env variables', () => {
      return http.okGet(app.getUrl(`/v1?token=${bundleV1.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundleV1.sessionJson))
        .then(() => expect(app.output()).to.be.string('env variables \'WIX-BOOT-SESSION-KEY\', \'WIX-BOOT-SESSION2-KEY\' set'))
    });

    it('should not load config and decrypt wixSession2-based session keys from provided env variables', () => {
      return http.okGet(app.getUrl(`/v2?token=${bundleV2.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundleV2.sessionJson))
        .then(() => expect(app.output()).to.be.string('env variables \'WIX-BOOT-SESSION-KEY\', \'WIX-BOOT-SESSION2-KEY\' set'))
    });
  });

  describe('dev mode with env overrides', () => {
    const bundleV1 = sessionTestkit.v1.aValidBundle({mainKey: '1234211331224111'});
    const bundleV2 = sessionTestkit.v2.aValidBundle();

    const env = envSupport.bootstrap({
      NODE_ENV: 'dev',
      APP_CONF_DIR: './non-existent',
      'WIX-BOOT-SESSION-KEY': bundleV1.mainKey,
      'WIX-BOOT-SESSION2-KEY': bundleV2.publicKey});
    const app = anApp(env).beforeAndAfter();

    it('should not load config and decrypt wixSession-based session keys from provided env variables', () => {
      return http.okGet(app.getUrl(`/v1?token=${bundleV1.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundleV1.sessionJson))
        .then(() => expect(app.output()).to.be.string('env variables \'WIX-BOOT-SESSION-KEY\', \'WIX-BOOT-SESSION2-KEY\' set'))
    });

    it('should not load config and decrypt wixSession2-based session keys from provided env variables', () => {
      return http.okGet(app.getUrl(`/v2?token=${bundleV2.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundleV2.sessionJson))
        .then(() => expect(app.output()).to.be.string('env variables \'WIX-BOOT-SESSION-KEY\', \'WIX-BOOT-SESSION2-KEY\' set'))
    });
  });

});

function anApp(env) {
  return testkit.server('./test/app', {env});
}

function keyPair() {
  const key = new NodeRSA({b: 512});

  return {
    private: key.exportKey('private'),
    public: key.exportKey('public')
  };
}
