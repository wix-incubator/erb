'use strict';
const wixCluster = require('wix-cluster'),
  wixLoggingPlugin = require('wix-logging-cluster-plugin');

module.exports = WixBootstrapCluster;

//TODO: validate config is provided
function WixBootstrapCluster(config) {

  this.run = (bootstrapExpress, appFn, cb) => {
    const app = appFn;
    const express = bootstrapExpress;

    if (!app) {
      throw Error('app function must be provided');
    }

    //TODO: function for builder must return callback
    wixCluster
      .builder(done => express.start(appFn(), done))
      .addPlugin(wixLoggingPlugin())
      .start(cb);
  };
}