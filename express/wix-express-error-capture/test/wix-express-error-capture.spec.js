'use strict';
const request = require('request'),
  express = require('express'),
  expect = require('chai').expect,
  wixExpressDomain = require('wix-express-domain'),
  wixExpressErrorCapture = require('..'),
  testkit = require('wix-http-testkit');

describe('wix express error capture middleware', function () {
  const server = aServer();

  server.beforeAndAfter();

  [{type: 'app', path: '/'}, {type: 'router', path: '/router/'}].forEach(setup => {
    it(`should intercept async errors and make sure errors are emitted on the response for ${setup.type}`, done => {
      request.get(server.getUrl(setup.path + 'async'), function (error, response, body) {
        expect(body).to.equal('we had an error - async');
        done();
      });
    });

    it(`should intercept sync errors and make sure errors are emitted on the response ${setup.type}`, done => {
      request.get(server.getUrl(setup.path + 'sync'), (error, response, body) => {
        expect(body).to.equal('we had an error - sync');
        done();
      });
    });
  });

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();
    const router = express.Router();

    app.use(wixExpressDomain);
    app.use(wixExpressErrorCapture.async);

    app.use((req, res, next) => {
      res.on('x-error', err => {
        res.status('500').send('we had an error - ' + err.message);
      });
      next();
    });

    addHandlers(app);
    addHandlers(router);
    app.use('/router', router);

    app.use(wixExpressErrorCapture.sync);

    return server;
  }

  function addHandlers(app) {
    app.get('/async', () => {
      process.nextTick(() => {
        throw new Error('async');
      });
    });
    app.get('/sync', () => {
      throw new Error('sync');
    });

  }
});