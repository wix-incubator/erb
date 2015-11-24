'use strict';
const express = require('express'),
  serverResponsePatch = require('wix-patch-server-response'),
  wixExpressDomain = require('wix-express-domain'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressErrorHandler = require('../../lib/wix-express-error-handler'),
  wixExpressTimeout = require('wix-express-timeout'),
  workerShutdown = require('wix-cluster').workerShutdown;


module.exports = function () {
  const app = express();

  serverResponsePatch.patch();
  app.use(wixExpressDomain);
  app.use(wixExpressErrorCapture.async);
  app.use(wixExpressTimeout.get(1000));

  app.use(wixExpressErrorHandler.handler);

  app.get('/', function(req, res) {
    res.write('Hello');
    res.end();
  });

  app.get('/async-die', function(req, res) {
    process.nextTick(function() {
      throw new Error('die');
    });
  });

  app.get('/just-die', function(req, res) {
    throw new Error('die');
  });

  app.get('/just-timeout', function(req, res) {

  });

  app.get('/write-partial-then-timeout', function(req, res) {
    res.write('I\'m partial');
  });

  app.get('/async-response-then-die', function(req, res) {
    process.nextTick(function() {
      res.write('I\'m ok');
      res.end();
      throw new Error('die');
    });
  });

  app.get('/just-response-then-die', function(req, res) {
    res.write('I\'m ok');
    res.end();
    throw new Error('die');
  });

  app.get('/async-partial-write-then-die', function(req, res) {
    process.nextTick(function() {
      res.write('I\'m partial');
      throw new Error('die');
    });
  });

  app.get('/just-partial-write-then-die', function(req, res) {
    res.write('I\'m partial');
    throw new Error('die');
  });

  app.use(wixExpressErrorCapture.sync);
  var server = app.listen(3000);
  workerShutdown.addResourceToClose(server);
  console.log('App listening on port: %s', 3000);
};