'use strict';
const express = require('express'),
  serverResponsePatch = require('wix-patch-server-response'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressErrorHandler = require('../../lib/wix-express-error-handler'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixCluster = require('wix-cluster');

function app() {
  process.on('uncaughtException', e => console.log('uncaught exception was emitted', e));

  return new Promise((resolve, reject) => {
    const app = express();

    serverResponsePatch.patch();
    app.use(wixExpressErrorCapture.async);
    app.use(wixExpressTimeout.get(1000));

    app.use(wixExpressErrorHandler.handler());

    app.get('/', (req, res) => res.send('Hello'));

    app.get('/async-die', () => process.nextTick(() => {
      const err = new Error('async die');
      err.code = 1;
      throw err;
    }));

    app.get('/just-die', () => {
      throw new Error('die');
    });

    app.get('/just-timeout', () => {
    });

    app.get('/write-partial-then-timeout', (req, res) => res.write('I\'m partial'));

    app.get('/async-response-then-die', (req, res) =>
      process.nextTick(() => {
        res.send('I\'m ok');
        throw new Error('die');
      }));

    app.get('/just-response-then-die', (req, res) => {
      res.send('I\'m ok');
      throw new Error('die');
    });

    app.get('/async-partial-write-then-die', (req, res) =>
      process.nextTick(() => {
        res.write('I\'m partial');
        throw new Error('die');
      }));

    app.get('/just-partial-write-then-die', (req, res) => {
      res.write('I\'m partial');
      throw new Error('die');
    });

    app.use(wixExpressErrorCapture.sync);

    express().use('/', app)
      .listen(process.env.PORT, err => {
        err ? reject(err) : resolve();
        console.log('App listening on port: %s', process.env.PORT);
      });
  });
}

wixCluster.run(app, {workerCount: 1});