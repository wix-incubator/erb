'use strict';
const expect = require('chai').expect,
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch'),
  emitter = require('wix-config-emitter'),
  shelljs = require('shelljs');

describe('run modes', function () {
  this.timeout(60000);

  describe('dev mode', () => {
    const env = envSupport.bootstrap();
    const app = testkit
      .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
      .beforeAndAfter();

    it('should run without config and with injected defaults', () =>
      fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}`)
        .then(res => expect(res.headers.get('x-seen-by')).to.equal('seen-by-dev'))
        .then(() => expect(app.stdout().join()).to.be.string('dev mode detected, using seen-by'))
    );
  });

  describe('production mode with config', () => {
    const env = envSupport.bootstrap({
      NODE_ENV: 'production',
      APP_CONF_DIR: './target/configs',
      'WIX-BOOT-SESSION-MAIN-KEY': '1234211331224111'
    });
    const app = testkit.server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'));

    before(() => {
      shelljs.rm('-rf', env.APP_CONF_DIR);
      return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
        .val('x_seen_by', 'seen-by-test')
        .emit().then(() => app.start());
    });

    after(() => app.stop());

    it('should run with values from config', () =>
      fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}`)
        .then(res => expect(res.headers.get('x-seen-by')).to.equal('seen-by-test'))
        .then(() => expect(app.stdout().join()).to.be.string('production mode detected, loading seen-by from config'))
    );
  });

  describe('production mode with env overrides', () => {
    const env = envSupport.bootstrap({
      NODE_ENV: 'production',
      APP_CONF_DIR: './non-existent',
      'WIX-BOOT-SESSION-MAIN-KEY': '1234211331224111',
      'WIX-BOOT-EXPRESS-SEEN-BY': 'seen-by-env'
    });
    const app = testkit
      .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
      .beforeAndAfter();

    it('should run without config and with injected defaults for seen-by', () =>
      fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}`)
        .then(res => expect(res.headers.get('x-seen-by')).to.equal('seen-by-env'))
        .then(() => expect(app.stdout().join()).to.be.string('production mode detected, env variable \'WIX-BOOT-EXPRESS-SEEN-BY\' set'))
    );
  });
});