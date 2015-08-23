// ignore the lint error of not having a function call.
// Mocha actually uses property getters as function calls (like .empty) and lint see those as errors by default
/*jshint -W030 */
var request = require('request');
var expect = require('chai').expect;
var expressTimeout = require('../wix-express-timeout');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
var testApp = server.getApp();

testApp.use(expressTimeout.middleware(10));

// send timeout response
testApp.use(function(req, res, next) {
  res.on('x-timeout', function() {
    res.status(503).send('timeout');
  });
  next();
});

testApp.get('/ok', function (req, res) {
  res.write('hi');
  res.end();
});
testApp.get('/slow', function (req, res) {
  setTimeout(function() {
    res.send("slow");
  }, 10000);
});

testApp.use('/slower/*', expressTimeout.middleware(100));

testApp.get('/slower/but-fine', function (req, res) {
  setTimeout(function() {
    res.send("slower/but-fine");
  }, 20);
});

testApp.get('/slower/not-fine', function (req, res) {
  setTimeout(function() {
    res.send("/slower/not-fine");
  }, 20000);
});






describe("wix monitor", function () {

  server.beforeAndAfter();

  beforeEach(function() {
    capturedMonitoringData = undefined;
  });

  it("should allow normal operations", function (done) {
    request.get('http://localhost:' + port + '/ok', function (error, response, body) {
      expect(response.statusCode).to.be.equal(200);
      done();
    });
  });

  it("should emit x-timeout event on response in case of timeout operation", function (done) {
    request.get('http://localhost:' + port + '/slow', function (error, response, body) {
      expect(response.statusCode).to.be.equal(503);
      done();
    });
  });

  it("should not timeout when overriding the timeout and the first times out assuming the second did not time out (allowing to set override timeout for specific operations)", function (done) {
    request.get('http://localhost:' + port + '/slower/but-fine', function (error, response, body) {
      expect(response.statusCode).to.be.equal(200);
      done();
    });
  });

  it("should timeout if the second middle does timeout in case of timeout override", function (done) {
    request.get('http://localhost:' + port + '/slower/not-fine', function (error, response, body) {
      expect(response.statusCode).to.be.equal(503);
      done();
    });
  });


});





