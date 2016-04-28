'use strict';
const express = require('express'),
  appInfo = require('wix-app-info');

//TODO: validate inputs
module.exports = (context, apps) => {
  const expressApp = express();
  expressApp.use('/app-info', appInfo({appName: context.app.name, appVersion: context.app.version}));
  apps.forEach(app => expressApp.use(app));
  return expressApp;
};