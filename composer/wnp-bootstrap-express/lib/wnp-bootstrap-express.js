'use strict';
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
  wixExpressErrorLogger = require('wix-express-error-logger');

module.exports = opts => (context, apps) => {
  const expressApp = express();

  expressApp.locals.newrelic = context.newrelic;
  //TODO: test this, as this is applicavle only for express.static
  expressApp.set('etag', false);
  expressApp.set('trust proxy', true);

  expressApp.use(wixExpressAspects.get([
    biAspect.builder(),
    petriAspect.builder(),
    webContextAspect.builder(opts.seenBy),
    wixSessionAspect.builder(
      token => context.session.v1.decrypt(token),
      token => context.session.v2.decrypt(token))]));
  expressApp.use(wixExpressErrorLogger);
  expressApp.use(wixExpressTimeout.get(opts.timeout));
  expressApp.use(wixExpressErrorCapture.async);
  expressApp.use(wixCachingPolicy.defaultStrategy());
  expressApp.use(wixExpressErrorHandler.handler());

  apps.forEach(app => {
    //TODO: validate that app is provided
    if (app.locals) {
      app.locals.newrelic = context.newrelic;
    }
    expressApp.use(app);
  });
  expressApp.use(wixExpressErrorCapture.sync);

  return expressApp;
};