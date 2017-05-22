const testkit = require('wix-stdouterr-testkit'),
  expect = require('chai').expect,
  app = require('../apps/embedded'),
  http = require('wnp-http-test-client'),
  _ = require('lodash');

const env = {
  PORT: 3100,
  MANAGEMENT_PORT: 3200,
  APP_LOG_DIR: '/some-for-test'
};

describe('wnp-bootstrap-composer', function() {
  const stdouterr = testkit.interceptor().beforeAndAfter();

  let stopApp;
  afterEach(() => {
    return stopApp ? stopApp() : _.noop;
  });

  it('should start a server and return a function that stops server', () => {
    return app().start({env})
      .then(stop => stopApp = _.once(stop))
      .then(() => verifyAppIsListening())
      .then(() => stopApp())
      .then(() => expect(stdouterr.output).to.be.string('main http server closed'))
      .then(() => expect(stdouterr.output).to.be.string('management http server closed'))
      .then(() => expect(verifyAppIsListening()).be.rejected);
  });

  it('should not pollute process.env except for new relic disable args', () => {
    const envBefore = Object.assign({}, process.env);
    return app().start({env})
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

  it('should attach and detach handler for unhandledRejections', () => {
    const unhandledBefore = process.listenerCount('unhandledRejection');
    return app().start({env})
      .then(stop => stopApp = _.once(stop))
      .then(() => expect(process.listenerCount('unhandledRejection')).to.equal(unhandledBefore + 1))
      .then(() => stopApp())
      .then(() => expect(process.listenerCount('unhandledRejection')).to.equal(unhandledBefore))
  });

  it('should start a server and see that the output contains the host\'s url', () => {
    return app().start({env})
      .then(stop => stopApp = _.once(stop))
      .then(() => expect(stdouterr.output).to.be.string('Host\'s URL is'));
  });

  function verifyAppIsListening() {
    return Promise.all([
      http.okGet('http://localhost:3100/health/is_alive'),
      http.okGet('http://localhost:3200/health/is_alive_detailed') 
    ]);
  }
});
