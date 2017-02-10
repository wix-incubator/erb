const express = require('express'),
  appInfo = require('wix-app-info');

module.exports = ({appName, appVersion, persistentDir}) => appFns => {
  const expressApp = express();
  expressApp.use('/app-info', appInfo({
    appName: appName,
    appVersion: appVersion,
    heapDumpTempDir: persistentDir
  }));

  return Promise.all(appFns.map(appFn => Promise.resolve().then(() => appFn(express()))))
    .then(apps => apps.forEach(app => expressApp.use(app)))
    .then(() => expressApp);
};
