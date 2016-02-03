'use strict';
const httpTestkit = require('wix-http-testkit'),
  jsonrpc = require('node-express-json-rpc2'),
  express = require('express'),
  TestkitBase = require('wix-testkit-base').TestkitBase;

module.exports.server = opts => new WixRpcServer(opts);

class WixRpcServer extends TestkitBase {
  constructor(opts) {
    super();
    this.server = httpTestkit.server(opts);
  }

  doStart() {
    return this.server.start();
  }

  doStop() {
    return this.server.stop();
  }

  addHandler(serviceName, handlers) {
    const app = express();
    app.use('/' + serviceName, jsonrpc());
    app.post('/' + serviceName, handlers);

    this.server.getApp().use(app);
    this.server.getApp().use('/_rpc', app);
  }

  getUrl(svcName) {
    return svcName ? `${this.server.getUrl()}/_rpc/${svcName}` : this.server.getUrl();
  }

  getPort() {
    return this.server.getPort();
  }
}