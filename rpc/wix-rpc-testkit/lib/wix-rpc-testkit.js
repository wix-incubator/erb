'use strict';
const httpTestkit = require('wix-http-testkit'),
  jsonrpc = require('node-express-json-rpc2'),
  express = require('express');

module.exports.server = opts => new WixRpcServer(opts);

function WixRpcServer(opts) {
  const server = httpTestkit.server(opts);

  this.start = done => server.start(done);
  this.stop = done => server.stop(done);
  this.beforeAndAfter = () => server.beforeAndAfter();
  this.beforeAndAfterEach = () => server.beforeAndAfterEach();

  this.addHandler = (serviceName, handlers) => {
    const app = express();
    app.use('/' + serviceName, jsonrpc());
    app.post('/' + serviceName, handlers);

    server.getApp().use(app);
    server.getApp().use('/_rpc', app);
  };

  this.getUrl = svcName => svcName ? `${server.getUrl()}/_rpc/${svcName}` : server.getUrl();
  this.getPort = () => server.getPort();
}