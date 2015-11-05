'use strict';
const request = require('request'),
  expect = require('chai').expect,
  wixExpressDomain = require('wix-express-domain'),
  wixExpressErrorCapture = require('..'),
  httpTestkit = require('wix-http-testkit');

describe('wix express error capture middleware', function () {
  const server = aServer();

  server.beforeAndAfter();

  it('should intercept async errors and make sure errors are emitted on the response', done => {
    request.get(`${server.getUrl()}/async`, function (error, response, body) {
      expect(body).to.equal('we had an error - async');
      done();
    });
  });

  it('should intercept sync errors and make sure errors are emitted on the response', done => {
    request.get(`${server.getUrl()}/sync`, (error, response, body) => {
      expect(body).to.equal('we had an error - sync');
      done();
    });
  });

  function aServer() {
    const server = httpTestkit.httpServer();
    const testApp = server.getApp();

    testApp.use(wixExpressDomain);
    testApp.use(wixExpressErrorCapture.async);

    testApp.use((req, res, next) => {
      res.on('x-error', err => {
        res.status('500').send('we had an error - ' + err.message);
      });
      next();
    });

    testApp.get('/async', () => {
      process.nextTick(() => {
        throw new Error('async');
      });
    });
    testApp.get('/sync', () => {
      throw new Error('sync');
    });

    testApp.use(wixExpressErrorCapture.sync);

    return server;
  }
});