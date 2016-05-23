'use strict';
const expect = require('chai').expect,
  envSupport = require('env-support'),
  testkit = require('wnp-bootstrap-composer-testkit'),
  http = require('wnp-http-test-client'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  emitter = require('wix-config-emitter'),
  shelljs = require('shelljs');

describe('bootstrap session', function() {
  this.timeout(10000);

  describe('development mode', () => {
    const app = anApp({NODE_ENV: 'development'}).beforeAndAfter();

    it('should decrypt session using dev keys', () => {
      const bundle = sessionTestkit.aValidBundle();
      return http.okGet(app.getUrl(`?token=${bundle.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundle.sessionJson))
        .then(() => expect(app.output()).to.be.string('dev mode detected, using session key'));
    });
  });

  describe('production mode with config', () => {
    const app = anApp({NODE_ENV: 'production', APP_CONF_DIR: './target/configs'});

    before(() => {
      shelljs.rm('-rf', app.env.APP_CONF_DIR);
      return emitter({sourceFolders: ['./templates'], targetFolder: app.env.APP_CONF_DIR})
        .val('crypto_main_key', '1234211331224111')
        .val('crypto_alternate_key', '')
        .emit().then(() => app.start());
    });

    after(() => app.stop());

    it('should decrypt session using keys from config', () => {
      const bundle = sessionTestkit.aValidBundle({mainKey: '1234211331224111'});
      return http.okGet(app.getUrl(`?token=${bundle.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundle.sessionJson))
        .then(() => expect(app.output()).to.be.string('production mode detected, loading session keys from config'))
    });
  });

  describe('production mode with env overrides', () => {
    const env = envSupport.bootstrap({
      NODE_ENV: 'production',
      APP_CONF_DIR: './non-existent',
      'WIX-BOOT-SESSION-MAIN-KEY': '1234211331224111',
      'WIX-BOOT-SESSION-ALTERNATE-KEY': ''});
    const app = anApp(env).beforeAndAfter();

    it('should not load config and decrypt session keys from provided env variables', () => {
      const bundle = sessionTestkit.aValidBundle({mainKey: '1234211331224111'});
      return http.okGet(app.getUrl(`?token=${bundle.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundle.sessionJson))
        .then(() => expect(app.output()).to.be.string('env variable \'WIX-BOOT-SESSION-MAIN-KEY\' set'))
    });
  });

  describe('dev mode with env overrides', () => {
    const env = envSupport.bootstrap({
      NODE_ENV: 'dev',
      APP_CONF_DIR: './non-existent',
      'WIX-BOOT-SESSION-MAIN-KEY': '1234211331224111',
      'WIX-BOOT-SESSION-ALTERNATE-KEY': ''});
    const app = anApp(env).beforeAndAfter();

    it('should not load config and decrypt session keys from provided env variables', () => {
      const bundle = sessionTestkit.aValidBundle({mainKey: '1234211331224111'});
      return http.okGet(app.getUrl(`?token=${bundle.token}`))
        .then(res => expect(res.json()).to.deep.equal(bundle.sessionJson))
        .then(() => expect(app.output()).to.be.string('env variable \'WIX-BOOT-SESSION-MAIN-KEY\' set'))
    });
  });

});

function anApp(env) {
  return testkit.server('./test/app', {env});
}