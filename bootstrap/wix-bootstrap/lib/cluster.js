'use strict';
const _ = require('lodash'),
  wixCluster = require('wix-cluster'),
  wixManagementApp = require('wix-management-app'),
  wixAppInfo = require('wix-app-info'),
  packageJson = require(process.cwd() + '/package.json'),
  appRunner = require('./servers/runner');

module.exports = WixBootstrapCluster;

//TODO: validate config is provided
function WixBootstrapCluster(opts) {

  this.run = (apps, cb) => {
    const config = _.cloneDeep(opts.cluster);
    const appFns = apps;

    if (!appFns) {
      throw Error('app function must be provided');
    }

    //TODO: function for builder must return callback
    wixCluster(_.merge(config, {
      app: done => appRunner.run(appFns, managementApp, done),
    })).start(cb);
  };
}

function appInfoApp() {
  return wixAppInfo({
    appName: packageJson.name,
    appVersion: packageJson.version
  });
}

function managementApp() {
  return wixManagementApp({
    appInfo: appInfoApp(),
    appPort: process.env.PORT,
    managementPort: process.env.MANAGEMENT_PORT,
    mountPoint: process.env.MOUNT_POINT
  }).start();
}