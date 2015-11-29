'use strict';
const express = require('express'),
  serverResponsePatch = require('wix-patch-server-response'),
  wixExpressDomain = require('wix-express-domain'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressErrorHandler = require('wix-express-error-handler').handler,
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressMonitor = require('wix-express-monitor'),
  wixExpressMonitorCallback = require('../../').wixExpressMonitorCallback;


module.exports = function () {
  const app = express();

  serverResponsePatch.patch();
  app.use(wixExpressDomain);
  app.use(wixExpressErrorCapture.async);
  app.use(wixExpressErrorHandler);
  app.use(wixExpressTimeout.get(100));

  app.use(wixExpressMonitor.get(wixExpressMonitorCallback));

  var x = 0;
  app.get('/', function(req, res) {
    x++;
    res.write('Hello');
    res.end();
  });

  app.get('/operation', function(req, res) {
    res.write('result');
    res.end();
  });

  app.get('/timeout', function(req, res) {
    res.write('this is gonna take time');
  });

  app.get('/error', function(req, res) {
    process.nextTick(function() {
      throw new Error('die');
    });
    res.end();
  });

  app.get('/custom-error', function(req, res) {
    process.nextTick(function() {
      throw new MountainError('some message');
    });
    res.end();
  });

  app.use(wixExpressErrorCapture.sync);
  app.listen(3000);
  console.log('App listening on port: %s', 3000);
};

function MountainError(message) {
  Error.captureStackTrace(this);
  this.message = message;
  this.name = 'MountainError';
}
MountainError.prototype = Object.create(Error.prototype);