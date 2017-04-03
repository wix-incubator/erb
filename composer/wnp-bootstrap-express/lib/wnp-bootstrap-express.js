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
  wixNewRelicRequestParams = require('wix-express-newrelic-parameters'),
  wixExpressMetering = require('wix-express-metering'),
  WixMeasuredMetering = require('wix-measured-metering');

module.exports = ({seenBy, timeout, newrelic, session, log, wixMeasuredFactory}, meteringEnabled = false) => {
  return appFns => {
    const expressMetrics = wixMeasuredFactory.collection('tag', 'WEB').collection('type', 'express');
    const {routesMetering, errorsMetering} = wixExpressMetering(new WixMeasuredMetering(expressMetrics));
    const expressApp = express();

    expressApp.locals.newrelic = newrelic;
    //TODO: test this, as this is applicable only for express.static
    expressApp.set('etag', false);
    expressApp.set('trust proxy', true);
    expressApp.disable('x-powered-by');
    //TODO: remove once fully operational
    if (meteringEnabled) {
      expressApp.use(routesMetering);
    }
    expressApp.use(wixExpressAspects.get([
      biAspect.builder(),
      petriAspect.builder(),
      webContextAspect.builder(seenBy),
      wixSessionAspect.builder(token => session.decrypt(token))]));
    //TODO: move 3 next middlewares out once migration is over
    expressApp.use(wixCachingPolicy.defaultStrategy());
    expressApp.use(wixExpressTimeout(timeout));
    expressApp.use(wixExpressErrorCapture(rethrowOnNextTick));
    expressApp.use(wixNewRelicRequestParams(newrelic));

    return Promise.all(appFns.map(appFn => Promise.resolve().then(() => appFn(expressAppForChild(timeout)))))
      .then(apps => apps.forEach(app => {
        //TODO: for backwards compatibility with legacy version where app is not injected but instead returned.
        if (app.locals) {
          app.disable('x-powered-by');
          app.locals.newrelic = newrelic;
        }
        expressApp.use(app);
      }))
      .then(() => {
        expressApp.use(wixExpressErrorLogger(log));
        //TODO: remove once fully operational
        if (meteringEnabled) {
          expressApp.use(errorsMetering);
        }
        expressApp.use(wixExpressErrorHandler());
        return expressApp;
      });
  };
};

function rethrowOnNextTick(error) {
  process.nextTick(() => {
    throw error;
  })
}

function expressAppForChild(timeout) {
  const app = express();
  app.use(wixExpressTimeout(timeout));
  app.use(wixExpressErrorCapture(rethrowOnNextTick));
  return app;
}
