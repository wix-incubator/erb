'use strict';
require('./lib/globals/patch-promise');
require('./lib/globals/cluster-aware-newrelic');

const BootstrapExpress = require('./lib/servers/express'),
  BootstrapWs = require('./lib/servers/web-sockets'),
  BootstrapRpc = require('./lib/rpc'),
  BootstrapCluster = require('./lib/cluster'),
  bootstrapConfig = require('wix-bootstrap-config'),
  cluster = require('cluster'),
  _ = require('lodash');

class WixBootstrap {
  constructor() {
    this._config = undefined;
    this.bootstrapRpc = undefined;
    this.apps = [];
  }

  rpcClient() {
    return this.bootstrapRpc.rpcClient(Array.prototype.slice.call(arguments));
  }

  run(appFn, cb) {
    if (!this._config) {
      this.setup({});
    }

    const callback = cb || _.noop;
    new BootstrapCluster(this._config).run([() => new BootstrapExpress(this._config, appFn)], callback);
  }

  start(cb) {
    if (!this._config) {
      this.setup({});
    }

    const callback = cb || _.noop;
    new BootstrapCluster(this._config).run(this.apps, callback);
  }

  express(appFnFile) {
    if (!this._config) {
      this.setup({});
    }

    this.apps.push(() => new BootstrapExpress(this._config, () => require(appFnFile)));
    return this;
  }


  ws(appFnFile) {
    if (!this._config) {
      this.setup({});
    }

    this.apps.push(() => new BootstrapWs(() => require(appFnFile)));
    return this;
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

module.exports = new WixBootstrap();