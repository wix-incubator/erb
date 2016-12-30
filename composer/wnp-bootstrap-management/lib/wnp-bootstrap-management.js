'use strict';
const express = require('express'),
  appInfo = require('wix-app-info');

module.exports = (context, appFns) => {
  const expressApp = express();
  expressApp.use('/app-info', appInfo({
    appName: context.app.name,
    appVersion: context.app.version,
    heapDumpTempDir: context.env.APP_PERSISTENT_DIR
  }));

  return Promise.all(appFns.map(appFn => Promise.resolve().then(() => appFn(express()))))
    .then(apps => apps.forEach(app => expressApp.use(app)))
    .then(() => expressApp);
};
