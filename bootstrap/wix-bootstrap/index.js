'use strict';
require('./lib/globals/bootstrap-globals');

const BootstrapExpress = require('./lib/servers/express-server'),
  BootstrapWs = require('./lib/servers/web-sockets-server'),
  BootstrapRpc = require('./lib/rpc'),
  BootstrapCluster = require('./lib/cluster'),
  bootstrapConfig = require('wix-bootstrap-config'),
  cluster = require('cluster'),
  _ = require('lodash'),
  join = require('path').join,
  wixCluster = require('wix-cluster');

let config = undefined;
let bootstrapRpc = undefined;
const apps = [];
const builder = { setup, express, ws, start, run};

module.exports.setup = setup;
module.exports.express = express;
module.exports.ws = ws;
module.exports.start = start;
module.exports.addShutdownHook = addShutdownHook;

//deprecated
module.exports.run = run;

module.exports.rpcClient = rpcClient;
module.exports.config = () => config;


function addShutdownHook(fn) {
  wixCluster.workerShutdown.addResourceToClose({ close: fn});
}

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
    bootstrapRpc = new BootstrapRpc(config);
  }

  return builder;
}
