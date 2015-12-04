'use strict';
const _ = require('lodash'),
  wixCluster = require('wix-cluster'),
  wixLoggingPlugin = require('wix-logging-cluster-plugin');

module.exports = WixBootstrapCluster;

//TODO: validate config/express is provided
function WixBootstrapCluster(config, bootstrapExpress) {

  this.run = (appFn, setupFn) => {
    const app = appFn;
    const setup = setupFn || _.noop;

    if (!app) {
      throw Error('app function must be provided');
    }

    wixCluster
      .builder(bootstrapApp(app, setup))
      .addPlugin(wixLoggingPlugin())
      .start();
  };

  function bootstrapApp(appFn, setupFn) {
    setupFn();
    return () => bootstrapExpress.start(appFn());
  }
}