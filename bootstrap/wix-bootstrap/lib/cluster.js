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

  //TODO: deprecate callback
  this.run = (apps, done) => {
    const cb = done || _.noop;
    const config = _.cloneDeep(opts.cluster);
    const appFns = apps;

    if (!appFns) {
      throw Error('app function must be provided');
    }

    return wixCluster
      .run(() => appRunner.run(appFns, managementApp, done), config)
      .then(cb)
      .catch(cb);
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