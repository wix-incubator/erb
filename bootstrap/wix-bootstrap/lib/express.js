'use strict';
const wixExpressDomain = require('wix-express-domain'),
  wixExpressReqContext = require('wix-express-req-context'),
  wixExpressPetri = require('wix-express-petri'),
  wixExpressSession = require('wix-express-session'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressAlive = require('wix-express-isalive'),
  express = require('express'),
  log = require('wix-logger').get('bootstrap');

class WixBootstrapExpress {
  constructor(opts) {
    this.timeout = opts.express.requestTimeout;
    this.sessionMainKey = opts.session.mainKey;
    this.sessionAlternateKey = opts.session.alternateKey;
  }

  _wireFirsts(app) {
    app.use(wixExpressDomain);
    app.use(wixExpressReqContext);
    app.use(wixExpressPetri);
    app.use(wixExpressSession.get(this.sessionMainKey, this.sessionAlternateKey));
    app.use(wixExpressTimeout.get(this.timeout));
    app.use(wixExpressErrorCapture.async);

    wixExpressAlive.addTo(app);

    return app;
  }

  _wireLasts(app) {
    app.use(wixExpressErrorCapture.sync);

    return app;
  }

  run(app) {
    let application = this._wireLasts(app(this._wireFirsts(express())));

    return express()
      .use(process.env.MOUNT_POINT, application)
      .listen(process.env.PORT, () =>
        log.debug('App listening on path: %s port: %s', process.env.MOUNT_POINT, process.env.PORT)
      );
  }
}

module.exports = opts => new WixBootstrapExpress(opts);