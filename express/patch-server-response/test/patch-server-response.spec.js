'use strict';
var request = require('request'),
  expect = require('chai').expect;
var serverResponsePatch = require('../patch-server-response');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
server.getApp().use(function (req, res, next) {
  res.on('x-before-flushing-headers', function () {
    res.append('x-before-flushing-headers', 'triggered');
  });
  next();
});
server.getApp().get('/write', function (req, res) {
  res.write('hi');
  res.end();
});
server.getApp().get('/send', function (req, res) {
  res.send('hi');
});
server.getApp().get('/redirect', function (req, res) {
  res.redirect('/bla');
});
server.getApp().get('/end', function (req, res) {
  res.end('/bla');
});


describe('patch-server-response .patch()', function () {

  server.beforeAndAfter();

  beforeEach(function () {
    serverResponsePatch.patch();
  });

  it('should emit the before-writing-headers event when using send', function (done) {
    request.get('http://localhost:' + port + '/send', function (error, response, body) {
      expect(response.headers).to.have.property('x-before-flushing-headers', 'triggered');
      done();
    });
  });

  it('should emit the before-writing-headers event when using write', function (done) {
    request.get('http://localhost:' + port + '/write', function (error, response, body) {
      expect(response.headers).to.have.property('x-before-flushing-headers', 'triggered');
      done();
    });
  });

  it('should emit the before-writing-headers event when using redirect', function (done) {
    request.get('http://localhost:' + port + '/redirect', function (error, response, body) {
      expect(response.headers).to.have.property('x-before-flushing-headers', 'triggered');
      done();
    });
  });
  it('should emit the before-writing-headers event when using end', function (done) {
    request.get('http://localhost:' + port + '/end', function (error, response, body) {
      expect(response.headers).to.have.property('x-before-flushing-headers', 'triggered');
      done();
    });
  });
});





