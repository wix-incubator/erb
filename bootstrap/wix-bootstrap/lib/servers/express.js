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
  wixExpressReqContext = require('wix-express-req-context');

class WixBootstrapExpress {
  constructor(config, appFn) {
    this.configRquestContext = config.requestContext || 'empty-seen-by';
    this.timeout = config.express.requestTimeout;
    this.sessionMainKey = config.session.mainKey;
    this.sessionAlternateKey = config.session.alternateKey;
    this.appFn = appFn;
  }

  _wireFirsts(app) {
    wixPatchServerResponse.patch();
    app.use(wixExpressDomain);
    app.use(wixExpressReqContext.get(this.configRquestContext));
    app.use(wixExpressPetri);
    app.use(wixExpressBi);
    app.use(wixExpressSession.get(this.sessionMainKey, this.sessionAlternateKey));
    app.use(wixExpressTimeout.get(this.timeout));
    app.use(wixExpressErrorCapture.async);
    app.use(wixExpressErrorHandler.handler(wixCluster.workerShutdown.shutdown));

    wixExpressAlive.addTo(app);

    return Promise.resolve(app);
  }

  _wireLasts(app) {
    app.use(wixExpressErrorCapture.sync);
    return Promise.resolve(app);
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