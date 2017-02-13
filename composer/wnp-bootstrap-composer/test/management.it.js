const testkit = require('./support/testkit'),
  expect = require('chai').use(require('chai-as-promised')).expect,
  fetch = require('node-fetch'),
  retryAsPromised = require('retry-as-promised'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  wixRpcClientSupport = require('wix-rpc-client-support');

describe('management app', function () {
  this.timeout(10000);

  describe('app-info', () => {
    const app = testkit.server('blank').beforeAndAfter();

    it('should server app-info app on management port', () => {
      aJsonGet(app.managementAppUrl('/app-inf/env'))
        .then(json => expect(json).to.contain.property('app-name'));
    });
  });

  describe('app, mounted on /', () => {
    const app = testkit.server('no-config', {MOUNT_POINT: '/'}).beforeAndAfter();
    it('should resolve correct "health/deployment/test" URL', () => {
      expect(app.managementAppUrl('/health/deployment/test')).to.equal('http://localhost:3004/health/deployment/test');
    });
  });

  describe('custom apps', () => {
    const app = testkit.server('management').beforeAndAfter();

    it('should allow to add express app and mount it onto management app port and mount point', () =>
      aGet(app.managementAppUrl('/custom')).then(res => expect(res.text).to.equal('custom-from-management'))
    );
  });

  describe('management-app-composer', () => {
    const app = testkit.server('management-app-composer').beforeAndAfter();

    it('should support managemnt function with 1 arg (context)', () => {
      return aGet(app.managementAppUrl('/management-1-arg'))
        .then(res => expect(res.text).to.equal('wnp-bootstrap-composer'))
    });

    it('should support management function with 2 args (app, context) where app is injected by composer', () => {
      return aGet(app.managementAppUrl('/management-2-args'))
        .then(res => expect(res.text).to.equal('wnp-bootstrap-composer'))
    });
  });
  
  describe('stop via management app', () => {

    describe('in production environment', () => {
      const app = testkit.app(require('./apps/blank/app'), {
        env: {
          NODE_ENV: 'production',
          NEW_RELIC_ENABLED: false,
          NEW_RELIC_NO_CONFIG_FILE: true,
          NEW_RELIC_LOG: 'stdout',
          APP_CONF_DIR: './',
          APP_TEMPL_DIR: './',
          APP_LOG_DIR: './',
          APP_PERSISTENT_DIR: './',
          HOSTNAME: 'localhost',
          WIX_BOOT_SESSION_KEY: sessionTestkit.v1.aValidBundle().mainKey,
          WIX_BOOT_SESSION2_KEY: sessionTestkit.v2.aValidBundle().publicKey,
          WIX_BOOT_STATSD_HOST: 'localhost',
          WIX_BOOT_SEEN_BY: 'dev',
          WIX_BOOT_RPC_SIGNING_KEY: wixRpcClientSupport.devSigningKey
        }
      }).beforeAndAfter();

      it('should return 403 and not kill the app', () =>
        fetch(app.managementAppUrl('/stop'), {method: 'POST'})
          .then(res => expect(res.status).to.equal(403))
          .then(() => aGet(app.appUrl('/health/is_alive')))
      );
    });

    describe('in dev mode', () => {
      const app = testkit.app(require('./apps/blank/app')).beforeAndAfter();

      it('should stop the app', () =>
        fetch(app.managementAppUrl('/stop'), {method: 'POST'})
          .then(res => expect(res.status).to.equal(200))
          .then(() => retry(() => expect(aGet(app.appUrl('/health/is_alive'))).to.eventually.be.rejected))
      );
    });

  });

  function aGet(url) {
    return fetch(url)
      .then(res => {
        expect(res.status).to.equal(200);
        return res.text().then(text => {
          return {res, text};
        });
      })
  }

  function aJsonGet(url) {
    return fetch(url)
      .then(res => {
        expect(res.status).to.equal(200);
        return res.json().then(json => {
          return {res, json};
        });
      })
  }

  function retry(cb) {
    return retryAsPromised(() => Promise.resolve().then(() => cb()), 5)
  }
});
