'use strict';
var request = require('request'),
  expect = require('chai').expect,
  wixDomain = require('wix-express-domain');
var wixExpressErrorCapture = require('../wix-express-error-capture');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
var testApp = server.getApp();

testApp.use(wixDomain.wixDomainMiddleware());
testApp.use(wixExpressErrorCapture.asyncErrorMiddleware);

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

testApp.use(wixExpressErrorCapture.syncErrorMiddleware);


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





