'use strict';
const express = require('express'),
  serverResponsePatch = require('wix-patch-server-response'),
  wixExpressDomain = require('wix-express-domain'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressMonitor = require('wix-express-monitor'),
  wixExpressMonitorCallback = require('../../lib/wix-metrics-cluster-client').wixExpressMonitorCallback;


module.exports = function () {
  const app = express();

  serverResponsePatch.patch();
  app.use(wixExpressDomain);
  app.use(wixExpressErrorCapture.async);
  app.use(wixExpressTimeout.get(10));

  app.use(wixExpressMonitor.get(wixExpressMonitorCallback));

  app.get('/', function(req, res) {
    res.write('Hello');
    res.end();
  });

  app.get('/operation', function(req, res) {
    res.write('result');
    res.end();
  });

  app.get('/die', function(req, res) {
    process.nextTick(function() {
      throw 'Error';
    });
    res.end();
  });

  app.use(wixExpressErrorCapture.sync);
  app.listen(3000);
};