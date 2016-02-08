'use strict';
require('./lib/globals/patch-promise');
require('./lib/globals/cluster-aware-newrelic');

const BootstrapExpress = require('./lib/servers/express'),
  BootstrapWs = require('./lib/servers/web-sockets'),
  BootstrapRpc = require('./lib/rpc'),
  BootstrapCluster = require('./lib/cluster'),
  bootstrapConfig = require('wix-bootstrap-config'),
  cluster = require('cluster'),
  _ = require('lodash'),
  join = require('path').join;

class WixBootstrap {
  constructor() {
    this._config = undefined;
    this.bootstrapRpc = undefined;
    this.apps = [];
  }

  rpcClient() {
    return this.bootstrapRpc.rpcClient(Array.prototype.slice.call(arguments));
  }

  express(appFnFile) {
    if (!this._config) {
      this.setup({});
    }
    const appFnAbsolute = join(process.cwd(), appFnFile);
    this.apps.push(new BootstrapExpress(this._config, () => require(appFnAbsolute)));
    return this;
  }

  ws(appFnFile) {
    const appFnAbsolute = join(process.cwd(), appFnFile);
    this.apps.push(new BootstrapWs(() => require(appFnAbsolute)));
    return this;
  }

  start(cb) {
    if (!this._config) {
      this.setup({});
    }

    const callback = cb || _.noop;
    new BootstrapCluster(this._config).run(this.apps, callback);
  }

  run(appFn, cb) {
    if (!this._config) {
      this.setup({});
    }

    const callback = cb || _.noop;
    new BootstrapCluster(this._config).run([new BootstrapExpress(this._config, appFn)], callback);
  }
  setup(opts) {
    this._config = bootstrapConfig.load(opts);

    if (cluster.isWorker) {
      require('wix-logging-client-support').addTo(require('wix-logging-client'));
      this.bootstrapRpc = new BootstrapRpc(this._config);
    }

    return this;
  }

  config() {
    return this._config;
  }
}

// TODO: do without _.bindAll()
module.exports = _.bindAll(new WixBootstrap(), 'rpcClient');
