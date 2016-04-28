'use strict';
const expect = require('chai').expect,
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  emitter = require('wix-config-emitter'),
  shelljs = require('shelljs');

describe('bootstrap session', () => {

  describe('development mode', () => {
    const env = envSupport.bootstrap({NODE_ENV: 'development'});
    const app = anApp(env).beforeAndAfter();

    it('should decrypt session using dev keys', () => {
      const bundle = sessionTestkit.aValidBundle();
      return fetch(`http://localhost:${env.PORT}/${env.MOUNT_POINT}?token=${bundle.token}`)
        .then(res => res.json())
        .then(json => expect(json).to.deep.equal(bundle.sessionJson))
        .then(() => expect(app.stdout().join()).to.be.string('dev mode detected, using session key'))
    });
  });

  describe('production mode with config', () => {
    const env = envSupport.bootstrap({NODE_ENV: 'production', APP_CONF_DIR: './target/configs'});
    const app = anApp(env);

    before(() => {
      shelljs.rm('-rf', env.APP_CONF_DIR);
      return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
        .val('crypto_main_key', '1234211331224111')
        .val('crypto_alternate_key', '')
        .emit().then(() => app.start());
    });

    after(() => app.stop());

    it('should decrypt session using keys from config', () => {
      const bundle = sessionTestkit.aValidBundle({mainKey: '1234211331224111'});
      return fetch(`http://localhost:${env.PORT}/${env.MOUNT_POINT}?token=${bundle.token}`)
        .then(res => res.json())
        .then(json => expect(json).to.deep.equal(bundle.sessionJson))
        .then(() => expect(app.stdout().join()).to.be.string('production mode detected, loading session keys from config'))
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
      return fetch(`http://localhost:${env.PORT}/${env.MOUNT_POINT}?token=${bundle.token}`)
        .then(res => res.json())
        .then(json => expect(json).to.deep.equal(bundle.sessionJson))
        .then(() => expect(app.stdout().join()).to.be.string('production mode detected, env variable \'WIX-BOOT-SESSION-MAIN-KEY\' set'))
    });
  });
});

function anApp(env) {
  return testkit
    .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'));
}