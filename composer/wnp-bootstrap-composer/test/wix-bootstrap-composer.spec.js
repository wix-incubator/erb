'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  app = require('./apps/embedded'),
  http = require('wnp-http-test-client'),
  _ = require('lodash');

const env = {
  PORT: 3100,
  MANAGEMENT_PORT: 3200,
  APP_LOG_DIR: '/some-for-test'
};

describe('wnp-bootstrap-composer', function() {
  this.timeout(20000);
  let stopApp;
  afterEach(() => {
    stopApp ? stopApp() : _.noop;
    stopApp = _.noop;
  });

  it('should start a server and return a function that stops server', () => {
    return app().start(env)
      .then(stop => stopApp = _.once(stop))
      .then(() => verifyAppIsListening())
      .then(() => stopApp())
      .then(() => expect(verifyAppIsListening()).to.eventually.be.rejected);
  });

  it('should not pollute process.env except for new relic disable args', () => {
    const envBefore = Object.assign({}, process.env);
    return app().start(env)
      .then(stop => stopApp = _.once(stop))
      .then(() => expect(process.env).to.deep.equal(Object.assign({}, envBefore, {
        NEW_RELIC_ENABLED: 'false',
        NEW_RELIC_NO_CONFIG_FILE: 'true',
        NEW_RELIC_LOG: 'stdout'
      })))
      .then(() => stopApp())
      .then(() => expect(process.env).to.deep.equal(Object.assign({}, envBefore, {
        NEW_RELIC_ENABLED: 'false',
        NEW_RELIC_NO_CONFIG_FILE: 'true',
        NEW_RELIC_LOG: 'stdout'
      })));
  });

  it('should attach and detach handlers for uncaughtException and unhandledRejections', () => {
    const uncaughtBefore = process.listenerCount('uncaughtException');
    const unhandledBefore = process.listenerCount('unhandledRejection');
    return app().start(env)
      .then(stop => stopApp = _.once(stop))
      .then(() => {
        expect(process.listenerCount('uncaughtException')).to.equal(uncaughtBefore + 1);
        expect(process.listenerCount('unhandledRejection')).to.equal(unhandledBefore + 1);
      })
      .then(() => stopApp())
      .then(() => {
        expect(process.listenerCount('uncaughtException')).to.equal(uncaughtBefore);
        expect(process.listenerCount('unhandledRejection')).to.equal(unhandledBefore);
      })
  });

  it('should log uncaught exceptions and kill process', () => {

  });

  it('should log unhandled rejections', () => {

  });



  function verifyAppIsListening() {
    return Promise.all([
      http.okGet('http://localhost:3100/health/is_alive'),
      http.okGet('http://localhost:3200/health/deployment/test')]);
  }
});
