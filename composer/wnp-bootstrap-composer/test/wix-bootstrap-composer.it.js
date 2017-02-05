'use strict';
const testkit = require('./support/testkit'),
  expect = require('chai').use(require('chai-as-promised')).expect,
  fetch = require('node-fetch'),
  WebSocket = require('ws'),
  retryAsPromised = require('retry-as-promised'),
  sessionTestkit = require('wix-session-crypto-testkit');

describe('wix bootstrap composer', function () {
  this.timeout(10000);

  describe('blank', () => {
    const app = testkit.server('blank').beforeAndAfter();

    it('should start app that responds to "/health/is_alive" on app port as per ops contract', () =>
      aGet(app.appUrl('/health/is_alive'))
    );

    it('should disable x-powered-by header by default', () =>
      aGet(app.appUrl('/health/is_alive'))
        .then(res => expect(res.res.headers.get('x-powered-by')).to.equal(null))
    );

    it('should start app that responds to "/health/deployment/test" on management app port as per ops contract', () =>
      aGet(app.managementAppUrl('/health/deployment/test'))
    );
  });

  describe('app, mounted on /', () => {
    const app = testkit.server('no-config', {MOUNT_POINT: '/'}).beforeAndAfter();
    it('should resolve correct "health/deployment/test" URL', () => {
      expect(app.managementAppUrl('/health/deployment/test')).to.equal('http://localhost:3004/health/deployment/test');
    });
  });

  describe('config', () => {
    const app = testkit.server('config', {PORT: 4000}).beforeAndAfter();

    it('should allow to have config function that receives context and its return value is passed to app', () =>
      aJsonGet(app.appUrl('/config'))
        .then(res => expect(res.json).to.deep.equal({port: '4000', customKey: 'customValue'}))
    );
  });

  describe('no-config', () => {
    const app = testkit.server('no-config', {PORT: 4000}).beforeAndAfter();

    it('should pass-over context for express function if config is not used', () =>
      aJsonGet(app.appUrl('/config'))
        .then(res => {
          expect(res.json).to.contain.property('env');
          expect(res.json).to.contain.property('app');
        })
    );
  });

  describe('composer', () => {
    const app = testkit.server('express').beforeAndAfter();

    it('should allow to provide app files to composer with absolute paths', () =>
      aGet(app.appUrl('/custom')).then(res => expect(res.text).to.equal('custom'))
    );
  });
  
  describe('express', () => {
    const app = testkit.server('express').beforeAndAfter();

    it('should allow to add express app and mount it onto main app port and mount point', () =>
      aGet(app.appUrl('/custom')).then(res => expect(res.text).to.equal('custom'))
    );
  });

  describe('http', () => {
    testkit.server('http', {PORT: 3000, MOUNT_POINT: '/'}).beforeAndAfter();

    it('should allow to serve websockets app', done => {
      const wsClient = new WebSocket('ws://localhost:3000', 'echo-protocol');
      wsClient.on('message', data => {
        expect(data).to.equal('something');
        done();
      });
      wsClient.on('open', () => wsClient.send('something'));
    });
  });

  describe('management', () => {
    const app = testkit.server('management').beforeAndAfter();

    it('should allow to add express app and mount it onto management app port and mount point', () =>
      aGet(app.managementAppUrl('/custom')).then(res => expect(res.text).to.equal('custom-from-management'))
    );
  });

  describe('plugin', () => {
    const app = testkit.server('plugin').beforeAndAfter();

    it('should allow to have config function that receives context and its return value is passed to app', () =>
      aJsonGet(app.appUrl('/plugin'))
        .then(res => expect(res.json).to.deep.equal({plugin: 'custom-plugin'}))
    );
  });

  describe('plugin-with-opts', () => {
    const app = testkit.server('plugin-with-opts').beforeAndAfter();

    it('should allow to have config function that receives context and its return value is passed to app', () =>
      aJsonGet(app.appUrl('/plugin'))
        .then(res => expect(res.json).to.deep.equal({plugin: 'custom-plugin with opts'}))
    );
  });


  describe('express-app-composer', () => {
    const app = testkit.server('express-app-composer').beforeAndAfter();

    it('should allow to provide custom main express app composer (ex. adds custom header to all responses)', () =>
      aGet(app.appUrl('/composer'))
        .then(res => {
          expect(res.res.headers.get('warning')).to.equal('from composer');
          expect(res.text).to.equal('composer')
        })
    );
  });

  describe('express-app-composer-disable', () => {
    const app = testkit.app(require('./apps/express-app-composer/app'), {disable: ['express']}).beforeAndAfter();

    it('should allow to provide custom main express app composer (ex. adds custom header to all responses)', () =>
      aGet(app.appUrl('/composer'))
        .then(res => {
          expect(res.res.headers.get('warning')).to.equal(null);
          expect(res.text).to.equal('composer')
        })
    );
  });

  describe('management-app-composer', () => {
    const app = testkit.server('management-app-composer').beforeAndAfter();

    it('should allow to provide custom management express app composer (that exposes custom endpoint)', () =>
      aGet(app.managementAppUrl('/composer'))
        .then(res => {
          expect(res.res.headers.get('warning')).to.equal('from management composer');          
          expect(res.text).to.equal('management')
        })
    );
  });

  describe('management-app-composer-disable', () => {
    const app = testkit.app(require('./apps/management-app-composer/app'), {disable: ['management']}).beforeAndAfter();

    it('should allow to provide custom management express app composer (that exposes custom endpoint)', () =>
      fetch(app.managementAppUrl('/custom-resource'))
        .then(res => expect(res.status).to.equal(404))
    );
  });

  describe('runner', () => {
    const app = testkit.server('runner').beforeAndAfter();

    it('should allow to provide custom app runner', () =>
      aGet(app.appUrl('/health/is_alive'))
        .then(() => expect(app.stdouterr()).to.be.string('Custom runner booted an app'))
    );
  });

  describe('runner-disable', () => {
    const app = testkit.app(require('./apps/runner/app'), {disable: ['runner']}).beforeAndAfter();

    it('should allow to provide custom app runner', () =>
      aGet(app.appUrl('/health/is_alive'))
        .then(() => expect(app.stdouterr()).to.not.be.string('Custom runner booted an app'))
    );
  });

  describe('runner-disable-via-env-variable', () => {
    const app = testkit.app(require('./apps/runner/app'), {env: {WIX_BOOT_DISABLE_MODULES: 'runner'}}).beforeAndAfter();

    it('should allow to provide custom app runner', () =>
      aGet(app.appUrl('/health/is_alive'))
        .then(() => expect(app.stdouterr()).to.not.be.string('Custom runner booted an app'))
    );
  });

  describe('environment-aware setup', () => {
    it('should inject defaults for mandatory variables in dev mode', () => {
      const app = testkit.server('run-modes');

      return app.start()
        .then(() => aJsonGet(app.appUrl('/env')))
        .then(res => {
          expect(res.json).to.contain.deep.property('APP_CONF_DIR', './test/configs');
          expect(res.json).to.contain.deep.property('NEW_RELIC_ENABLED', 'false');
          expect(res.json).to.contain.deep.property('NEW_RELIC_NO_CONFIG_FILE', 'true');
          expect(res.json).to.contain.deep.property('NEW_RELIC_LOG', 'stdout');
        }).then(() => app.stop());
    });

    it('should validate mandatory environment variables in production', () => {
      const app = testkit.server('run-modes', {
        NODE_ENV: 'production',
        NEW_RELIC_ENABLED: false,
        NEW_RELIC_NO_CONFIG_FILE: true,
        NEW_RELIC_LOG: 'stdout'
      });

      return Promise.resolve()
        .then(() => expect(app.start()).to.be.rejected)
        .then(() => expect(app.stdouterr()).to.be.string('Mandatory env variable \'APP_CONF_DIR\' is missing'));
    });
  });

  describe('httpServer', () => {
    const app = testkit.server('express').beforeAndAfter();

    it('should patch main http server to emit "x-before-flushing-headers" event on http response', () =>
      fetch(app.appUrl('/patch')).then(res =>
        expect(res.headers.raw()).to.have.property('x-before-flushing-headers'))
    );
  });

  describe('error handlers', () => {
    const app = testkit.server('error-handlers').beforeAndAfterEach();

    it('log unhandled rejections and keep app running', () =>
      aGet(app.appUrl('/unhandled-rejection'))
        .then(() => retry(() => {
          expect(app.stdouterr()).to.be.string('Unhandled Rejection at: Promise');
          expect(app.stdouterr()).to.be.string('at process._tickCallback');
        }))
        .then(() => aGet(app.appUrl('/ok')))
    );

    it('log uncaught exceptions and allow process to die', () =>
      aGet(app.appUrl('/uncaught-exception'))
        .then(() => retry(() => {
          expect(app.stdouterr()).to.be.string('Error: uncaught');
          expect(app.stdouterr()).to.be.string('at process._tickCallback');
        }))
        .then(() => expect(aGet(app.appUrl('/ok'))).to.eventually.be.rejected)
    );
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
          'WIX_BOOT_SESSION_KEY': sessionTestkit.v1.aValidBundle().mainKey,
          'WIX_BOOT_SESSION2_KEY': sessionTestkit.v2.aValidBundle().publicKey
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
