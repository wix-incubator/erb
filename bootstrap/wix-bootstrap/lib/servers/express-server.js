'use strict';
const _ = require('lodash'),
  newrelic = require('newrelic'),
  express = require('express'),
  wixExpressErrorHandler = require('wix-express-error-handler'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressAlive = require('wix-express-isalive'),
  wixPatchServerResponse = require('wix-patch-server-response'),
  wixCachingPolicy = require('wix-express-caching-policy'),
  middlewaresComposer = require('wix-express-middleware-composer'),
  wixExpressAspects = require('wix-express-aspects'),
  biAspect = require('wix-bi-aspect'),
  petriAspect = require('wix-petri-aspect'),
  webContextAspect = require('wix-web-context-aspect'),
  wixSessionAspect = require('wix-session-aspect'),
  wixExpressErrorLogger = require('wix-express-error-logger'),
  wixSessionCrypto = require('wix-session-crypto');


class WixBootstrapExpress {
  constructor(config, appFn) {
    this.seenBy = config.requestContext && config.requestContext.seenByInfo;
    this.timeout = config.express.requestTimeout;
    this.sessionMainKey = config.session.mainKey;
    this.newSessionKey = config.session.newSessionKey;
    this.appFn = appFn;
  }

  _unless(paths, middleware) {
    return function(req, res, next) {
      let unless = _.reduce(paths, (res, route) => {
        return res || req.path.startsWith(route);
      }, false);
      if (unless) {
        return next();
      } else {
        return middleware(req, res, next);
      }
    };
  }

  _wireFirsts(app) {
    app.set('etag', false);
    app.locals.newrelic = newrelic;
    wixPatchServerResponse.patch();
    app.use(this._unless(['/health/is_alive', '/static'], middlewaresComposer.get(this._middlewares())));
    wixExpressAlive.addTo(app);
    return Promise.resolve(app);
  }

  _wireLasts(app) {
    app.use(wixExpressErrorCapture.sync);
    return Promise.resolve(app);
  }

  _middlewares() {
    return [
      wixExpressAspects.get([
        biAspect.builder(),
        petriAspect.builder(),
        webContextAspect.builder(this.seenBy),
        wixSessionAspect.builder(
          data => wixSessionCrypto.v1.get(this.sessionMainKey).decrypt(data),
          data => wixSessionCrypto.v2.get(this.newSessionKey).decrypt(data))]),
      wixExpressErrorLogger,
      wixExpressTimeout.get(this.timeout),
      wixExpressErrorCapture.async,
      wixCachingPolicy.defaultStrategy(),
      wixExpressErrorHandler.handler()];
  }


  attach(server) {
    const app = express();

    return this._wireFirsts(app)
      .then(() => this._promisify(this.appFn()(app, _.noop)))
      .then(() => this._wireLasts(app))
      .then(() => server.on('request', express().use(process.env.MOUNT_POINT, app)));
  }

  _promisify(app) {
    return (app instanceof Promise) ? app : Promise.resolve();
  }
}

module.exports = WixBootstrapExpress;