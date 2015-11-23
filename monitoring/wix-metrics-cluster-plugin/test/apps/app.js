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

  var x = 0;
  app.get('/', function(req, res) {
    x++;
    res.write('Hello');
    res.end();
  });

  setInterval(() => {
    console.log(x);
  }, 1000);

  app.get('/operation', function(req, res) {
    res.write('result');
    res.end();
  });

  app.get('/die', function(req, res) {
    process.nextTick(function() {
      throw new Error('die');
    });
    res.end();
  });

  app.use(wixExpressErrorCapture.sync);
  app.listen(3000);
  console.log('App listening on port: %s', 3000);
};