'use strict';
const wixCluster = require('wix-cluster'),
  wixExpressErrorHandler = require('wix-express-error-handler'),
  wixExpressDomain = require('wix-express-domain'),
  wixExpressPetri = require('wix-express-petri'),
  wixExpressBi = require('wix-express-bi'),
  wixExpressSession = require('wix-express-session'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressAlive = require('wix-express-isalive'),
  express = require('express'),
  wixPatchServerResponse = require('wix-patch-server-response'),
  wixExpressReqContext = require('wix-express-req-context'),
  log = require('wix-logger').get('bootstrap');

class WixBootstrapExpress {
  constructor(config) {
    this.configRquestContext = config.requestContext || 'empty-seen-by';
    this.timeout = config.express.requestTimeout;
    this.sessionMainKey = config.session.mainKey;
    this.sessionAlternateKey = config.session.alternateKey;
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

    return app;
  }

  _wireLasts(app) {
    app.use(wixExpressErrorCapture.sync);
    return app;
  }

  start(app, cb) {
    const expressApp = this._wireFirsts(express());

    app(expressApp, () => {
      const wiredApp = this._wireLasts(expressApp);

      express()
        .use(process.env.MOUNT_POINT, wiredApp)
        .listen(process.env.PORT, () => {
          log.debug('App listening on path: %s port: %s', process.env.MOUNT_POINT, process.env.PORT);
          cb();
        });
    });
  }
}

module.exports = WixBootstrapExpress;