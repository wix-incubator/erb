'use strict';
const httpTestkit = require('wix-http-testkit'),
  jsonrpc = require('node-express-json-rpc2'),
  _ = require('lodash'),
  express = require('express');

module.exports.server = (handlers, opts) => new RpcServer(handlers, opts);

function RpcServer(handlers, opts) {
  const options = opts || {};
  const path = options.path || '/';
  const testkitOpts = options.port ? {port: options.port} : {};
  const rpcApp = express();

  _.forEach(handlers, (ops, handler) => {
    const service = _.startsWith(handler, '/') ? handler : `/${handler}`;

    rpcApp.use(service, jsonrpc());
    rpcApp.post(service, (req, res) => _.forEach(ops, (fn, op) => res.rpc(op, fn)));
  });

  const server = httpTestkit.httpServer(testkitOpts);
  server.getApp().use(path, rpcApp);

  return server;
}