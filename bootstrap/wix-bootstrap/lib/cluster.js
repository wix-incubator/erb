'use strict';
const wixCluster = require('wix-cluster'),
  wixManagementApp = require('wix-management-app'),
  wixAppInfo = require('wix-app-info'),
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
    wixCluster({
      app: done => decoreatedApp(express, appFn, done),
      managementApp: managementApp(),
      plugins: [wixLoggingPlugin()]
    }).start(cb);
  };
}

function decoreatedApp(express, appFn, done) {
  require('newrelic');
  express.start(appFn(), done);
}

function managementApp() {
  return wixManagementApp({
    appInfo: wixAppInfo,
    appPort: process.env.PORT,
    managementPort: process.env.MANAGEMENT_PORT,
    mountPoint: process.env.MOUNT_POINT
  });
}