const testkit = require('./support/testkit'),
  expect = require('chai').use(require('chai-as-promised')).expect,
  fetch = require('node-fetch'),
  WebSocket = require('ws');

describe('wix bootstrap composer', function () {

  describe('config', () => {
    const app = testkit.server('config', {PORT: 4000}).beforeAndAfter();

    it('should allow to have config function that receives context and its return value is passed to app', () => {
      return aJsonGet(app.appUrl('/config')).then(res =>
        expect(res.json).to.deep.equal({port: '4000', customKey: 'customValue'}));
    });
  });

  describe('no-config', () => {
    const app = testkit.server('no-config', {PORT: 4000}).beforeAndAfter();

    it('should pass-over context for express function if config is not used', () => {
      return aJsonGet(app.appUrl('/config')).then(res =>
        expect(res.json.app.name).to.equal('wix-bootstrap-composer'));
    });
  });

  describe('composer', () => {
    const app = testkit.server('express').beforeAndAfter();

    it('should allow to provide app files to composer with absolute paths', () =>
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
});
