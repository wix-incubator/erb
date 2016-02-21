'use strict';
const _ = require('lodash'),
  express = require('express'),
  wixCluster = require('wix-cluster'),
  wixExpressErrorHandler = require('wix-express-error-handler'),
  wixExpressDomain = require('wix-express-domain'),
  wixExpressPetri = require('wix-express-petri'),
  wixExpressBi = require('wix-express-bi'),
  wixExpressSession = require('wix-express-session'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressAlive = require('wix-express-isalive'),
  wixPatchServerResponse = require('wix-patch-server-response'),
  wixExpressReqContext = require('wix-express-req-context'),
  wixCachingPolicy = require('wix-express-caching-policy'),
  middlewaresComposer = require('wix-express-middleware-composer');

class WixBootstrapExpress {
  constructor(config, appFn) {
    this.configRquestContext = config.requestContext || 'empty-seen-by';
    this.timeout = config.express.requestTimeout;
    this.sessionMainKey = config.session.mainKey;
    this.sessionAlternateKey = config.session.alternateKey;
    this.appFn = appFn;
  }

  _unless(path, middleware) {
    return function(req, res, next) {
      if (path === req.path) {
        return next();
      } else {
        return middleware(req, res, next);
      }
    };
  }


  _wireFirsts(app) {
    app.set('etag', false);
    wixPatchServerResponse.patch();
    app.use(this._unless('/health/is_alive', middlewaresComposer.get(this._middlewares())));
    wixExpressAlive.addTo(app);
    return Promise.resolve(app);
  }

  _wireLasts(app) {
    app.use(wixExpressErrorCapture.sync);
    return Promise.resolve(app);
  }

  _middlewares() {
    return [wixExpressDomain,
      wixExpressReqContext.get(this.configRquestContext),
      wixExpressPetri,
      wixExpressBi,
      wixExpressSession.get(this.sessionMainKey, this.sessionAlternateKey),
      wixExpressTimeout.get(this.timeout),
      wixExpressErrorCapture.async,
      wixCachingPolicy.defaultStrategy(),
      wixExpressErrorHandler.handler(wixCluster.workerShutdown.shutdown)];
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