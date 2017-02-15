const sinon = require('sinon'),
  httpTestkit = require('wix-http-testkit'),
  Logger = require('wnp-debug').Logger,
  WixConfig = require('wix-config'),
  bootstrapSession = require('wnp-bootstrap-session'),
  bootstrapExpress = require('..');

module.exports = (appFn, overrides = {}) => {

  const httpServer = httpTestkit.server();
  const env = overrides.env || {};
  const log = overrides.log || sinon.createStubInstance(Logger);
  const config = overrides.config || sinon.createStubInstance(WixConfig);
  const newrelic = overrides.newrelic || {addCustomParameters: sinon.spy(), getBrowserTimingHeader: sinon.spy()};
  const timeout = overrides.timeout || 10000;

  const session = bootstrapSession({env, config, log});

  const compose = () => bootstrapExpress({env, config, timeout, newrelic, session, log})([appFn])
    .then(composed => httpServer.getApp().use(composed));
  const start = () => compose().then(() => reset()).then(() => require('wix-patch-server-response').patch()).then(() => httpServer.start());
  const stop = () => httpServer.stop().then(() => require('wix-patch-server-response').unpatch());
  const reset = () => {
    log.reset && log.reset();
    config.reset && config.reset();
    newrelic.addCustomParameters && newrelic.addCustomParameters.reset();
    newrelic.getBrowserTimingHeader && newrelic.getBrowserTimingHeader.reset();
  };

  const app = {
    getUrl: path => httpServer.getUrl(path),
    express: httpServer.getApp(),
    beforeAndAfter: function () {
      before(start);
      after(stop);
      beforeEach(reset);
      return app;
    },
    beforeAndAfterEach: function () {
      beforeEach(start);
      afterEach(stop);
      return app;
    },
    reset,
    start,
    stop
  };

  return {log, config, newrelic, app};
};
