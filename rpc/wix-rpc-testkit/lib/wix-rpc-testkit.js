'use strict';
const httpTestkit = require('wix-http-testkit'),
  _ = require('lodash'),
  jsonrpc = require('node-express-json-rpc2'),
  express = require('express');

module.exports.server = opts => new WixRpcServer(opts);

function WixRpcServer(opts) {
  const server = httpTestkit.httpServer(opts);

  function start(done) {
    const cb = done || _.noop;
    return new Promise((resolve, reject) => {
      try {
        server.listen(() => {
          cb();
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  function stop(done) {
    const cb = done || _.noop;
    return new Promise((resolve, reject) => {
      try {
        server.close(() => {
          cb();
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  this.start = done => start(done);

  this.stop = done => stop(done);

  this.beforeAndAfter = () => {
    before(() => start());
    after(() => stop());
  };

  this.beforeAndAfterEach = () => {
    beforeEach(() => start());
    afterEach(() => stop());
  };

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