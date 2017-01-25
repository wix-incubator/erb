const express = require('express'),
  wixExpressErrorHandler = require('wix-express-error-handler'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixCachingPolicy = require('wix-express-caching-policy'),
  wixExpressAspects = require('wix-express-aspects'),
  biAspect = require('wix-bi-aspect'),
  petriAspect = require('wix-petri-aspect'),
  webContextAspect = require('wix-web-context-aspect'),
  wixSessionAspect = require('wix-session-aspect'),
  wixExpressErrorLogger = require('wix-express-error-logger'),
  log = require('wnp-debug')('bootstrap-express'),
  wixNewRelicRequestParams = require('wix-express-newrelic-parameters');

module.exports = ({seenBy, timeout}) => ({newrelic, session}, appFns) => {
  const expressApp = express();

  expressApp.locals.newrelic = newrelic;
  //TODO: test this, as this is applicable only for express.static
  expressApp.set('etag', false);
  expressApp.set('trust proxy', true);
  expressApp.disable('x-powered-by');

  expressApp.use(wixExpressAspects.get([
    biAspect.builder(),
    petriAspect.builder(),
    webContextAspect.builder(seenBy),
    wixSessionAspect.builder(
      token => session.v1.decrypt(token),
      token => session.v2.decrypt(token))]));
  //TODO: move 3 next middlewares out once migration is over
  expressApp.use(wixCachingPolicy.defaultStrategy());
  expressApp.use(wixExpressTimeout(timeout));
  expressApp.use(wixExpressErrorCapture(rethrowOnNextTick));
  expressApp.use(wixNewRelicRequestParams(newrelic));

  return Promise.all(appFns.map(appFn => Promise.resolve().then(() => appFn(expressAppForChild(timeout)))))
    .then(apps => apps.forEach(app => {
      //TODO: for backwards compatability with legacy version where app is not injected but instead returned.
      if (app.locals) {
        app.disable('x-powered-by');
        app.locals.newrelic = newrelic;
      }
      expressApp.use(app);
    }))
    .then(() => {
      expressApp.use(wixExpressErrorLogger(log));
      expressApp.use(wixExpressErrorHandler());
      return expressApp;
    });
};

function rethrowOnNextTick(error) {
  process.nextTick(() => {
    throw error;
  })
}

function expressAppForChild(timeout) {
  const app = express();
  app.use(wixCachingPolicy.defaultStrategy());
  app.use(wixExpressTimeout(timeout));
  app.use(wixExpressErrorCapture(rethrowOnNextTick));
  return app;
}
