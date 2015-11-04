'use strict';
var request = require('request'),
  expect = require('chai').expect,
  wixDomainMiddleware = require('wix-express-domain'),
  wixExpressErrorCapture = require('..');

var port = 3030;
var server = require('wix-http-testkit').httpServer({port: port});
var testApp = server.getApp();

testApp.use(wixDomainMiddleware);
testApp.use(wixExpressErrorCapture.async);

testApp.use(function (req, res, next) {
  res.on('x-error', function (err) {
    res.status('500').send('we had an error - ' + err.message);
  });
  next();
});

testApp.get('/errorInAsyncFlow', function (req, res) {
  process.nextTick(function () {
    throw new Error('async bla!!!');
  });
});
testApp.get('/errorInSyncFlow', function (req, res) {
  throw new Error('sync bla!!!');
});

testApp.use(wixExpressErrorCapture.sync);


describe('Wix Domain middleware', function () {

  server.beforeAndAfter();

  it('should intercept errors and make sure errors are emitted on the HTTP response - async flow', function (done) {
    request.get('http://localhost:' + port + '/errorInAsyncFlow', function (error, response, body) {
      expect(body).to.equal('we had an error - async bla!!!');
      done();
    });
  });

  it('should intercept errors and make sure errors are emitted on the HTTP response - sync flow', function (done) {
    request.get('http://localhost:' + port + '/errorInSyncFlow', function (error, response, body) {
      expect(body).to.equal('we had an error - sync bla!!!');
      done();
    });
  });
});