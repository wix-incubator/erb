'use strict';
const httpTestkit = require('wix-http-testkit'),
  jsonrpc = require('./node-express-json-rpc2-clone'),
  express = require('express'),
  TestkitBase = require('wix-testkit-base').TestkitBase;

module.exports.server = opts => new WixRpcServer(opts);

class WixRpcServer extends TestkitBase {
  constructor(opts) {
    super();
    this.server = httpTestkit.server(opts);
    this.handlers = {};
  }

  doStart() {
    return this.server.doStart();
  }

  doStop() {
    this.reset();
    return this.server.doStop();
  }

  addHandler(serviceName, handlers) {
    const app = express();
    app.use('/' + serviceName, jsonrpc());
    app.post('/' + serviceName, handlers);

    this.server.getApp().use(app);
    this.server.getApp().use('/_rpc', app);
  }

  reset() {
    Object.keys(this.handlers).forEach(serviceName => this.handlers[serviceName] = {});
  }

  serviceHandler(serviceName) {
    return (req, res) => {
      const service = this.handlers[serviceName];
      Object.keys(service).forEach(methodName => {
        res.rpc(methodName, (params, respond) => respond(service[methodName](params, req)));
      });
    };
  }

  setMethodHandler(serviceName, methodName, handler) {
    if (this.handlers[serviceName]) {
      this.handlers[serviceName][methodName] = handler;
    } else {
      this.handlers[serviceName] = {[methodName]: handler};
      this.addHandler(serviceName, this.serviceHandler(serviceName));
    }
  }

  when(serviceName, methodName) {
    const wrapReturnValue = (fn, key) => function () {
      return {[key]: fn.apply(this, arguments)};
    };
    const fn = handler => typeof handler === 'function' ? handler : () => handler;
    const setHandler = handler => this.setMethodHandler(serviceName, methodName, handler);
    const handlerWithKey = key => handler => setHandler(wrapReturnValue(fn(handler), key));
    return {respond: handlerWithKey('result'), throw: handlerWithKey('error')};
  }

  getUrl(svcName) {
    return svcName ? `${this.server.getUrl()}/_rpc/${svcName}` : this.server.getUrl();
  }

  getPort() {
    return this.server.getPort();
  }
}