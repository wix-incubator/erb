const express = require('express'),
  appInfo = require('wix-app-info'),
  wixExpressErrorHandler = require('wix-express-error-handler'),
  wixExpressErrorLogger = require('wix-express-error-logger');

module.exports = ({appName, appVersion, persistentDir, log}) => appFns => {
  const expressApp = express();
  expressApp.use('/app-info', appInfo({
    appName: appName,
    appVersion: appVersion,
    profilingResourcesDir: persistentDir
  }));

  return Promise.all(appFns.map(appFn => Promise.resolve().then(() => appFn(express()))))
    .then(apps => apps.forEach(app => expressApp.use(app)))
    .then(() => {
      expressApp.use(wixExpressErrorLogger(log));
      expressApp.use(wixExpressErrorHandler());
      return expressApp;
    });
};
