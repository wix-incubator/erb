'use strict';
require('./lib/globals/bootstrap-globals');

const BootstrapExpress = require('./lib/servers/express'),
  BootstrapWs = require('./lib/servers/web-sockets'),
  BootstrapRpc = require('./lib/rpc'),
  BootstrapCluster = require('./lib/cluster'),
  bootstrapConfig = require('wix-bootstrap-config'),
  cluster = require('cluster'),
  _ = require('lodash'),
  join = require('path').join;

let config = undefined;
let bootstrapRpc = undefined;
const apps = [];

module.exports.setup = setup;
module.exports.express = express;
module.exports.ws = ws;
module.exports.start = start;

//deprecated
module.exports.run = run;

module.exports.rpcClient = rpcClient;
module.exports.config = () => config;

const builder = {
  setup: module.exports.setup,
  express: module.exports.express,
  ws: module.exports.ws,
  start: module.exports.start,
  run: module.exports.run
};

function express(appFnFile) {
  if (!config) {
    setup({});
  }
  const appFnAbsolute = join(process.cwd(), appFnFile);
  apps.push(new BootstrapExpress(config, () => require(appFnAbsolute)));

  return builder;
}

function ws(appFnFile) {
  const appFnAbsolute = join(process.cwd(), appFnFile);
  apps.push(new BootstrapWs(() => require(appFnAbsolute)));
  return builder;
}

function rpcClient() {
  return bootstrapRpc.rpcClient(Array.prototype.slice.call(arguments));
}

function start(cb) {
  if (!config) {
    setup({});
  }

  const callback = cb || _.noop;
  new BootstrapCluster(config).run(apps, callback);
}

//DEPRECATED
function run(appFn, cb) {
  if (!config) {
    setup({});
  }

  const callback = cb || _.noop;
  new BootstrapCluster(config).run([new BootstrapExpress(config, appFn)], callback);
}

function setup(opts) {
  config = bootstrapConfig.load(opts);

  if (cluster.isWorker) {
    require('wix-logging-client-support').addTo(require('wix-logging-client'));
    bootstrapRpc = new BootstrapRpc(config);
  }

  return builder;
}
