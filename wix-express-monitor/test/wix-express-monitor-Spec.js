// ignore the lint error of not having a function call.
// Mocha actually uses property getters as function calls (like .empty) and lint see those as errors by default
/*jshint -W030 */
var request = require('request');
var expect = require('chai').expect;
var serverResponsePatch = require('patch-server-response');
var wixDomain = require('wix-express-domain');
var expressTimeout = require('wix-express-timeout');
var expressMonitor = require("../wix-express-monitor");

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
var testApp = server.getApp();

serverResponsePatch.patch();
testApp.use(wixDomain.wixDomainMiddleware());

var capturedMonitoringData;
testApp.use(expressMonitor(function(monitor) {
  capturedMonitoringData = monitor;
}));

testApp.get('/ok', function (req, res) {
  res.write('hi');
  res.end();
});
testApp.get('/slow', function (req, res) {
  res.append('an header', 'a value');
  setTimeout(function() {
    res.send("slow");
  }, 10);
});
testApp.use('/timeout', expressTimeout.middleware(10));
testApp.get('/timeout', function (req, res) {
  res.on('x-timeout', function() {
    res.status(504).send("timeout");
  });
});
testApp.get('/error-sync', function (req, res) {
  res.on('x-error', function() {
    res.status(500).send("error");
  });
  throw new Error('Sync error');
});
testApp.get('/error-async', function (req, res) {
  res.on('x-error', function() {
    res.status(500).send("error");
  });
  process.nextTick(function() {
    throw new Error('Async error');
  });
});
testApp.use(wixDomain.expressErrorHandlerMiddleware);




describe("wix monitor", function () {

  server.beforeAndAfter();

  beforeEach(function() {
    capturedMonitoringData = undefined;
  });

  it("should capture ok response", function (done) {
    request.get('http://localhost:' + port + '/ok', function (error, response, body) {
      expect(capturedMonitoringData.operationName).to.be.equal('/ok');
      expect(capturedMonitoringData.start).to.be.a('number');
      expect(capturedMonitoringData.timeToFirstByte).to.be.a('number');
      expect(capturedMonitoringData.finish).to.be.a('number');
      expect(capturedMonitoringData.timeout).to.be.an('undefined');
      expect(capturedMonitoringData.errors).to.be.empty;
      done();
    });
  });

  it("should capture slow responses", function (done) {
    request.get('http://localhost:' + port + '/slow', function (error, response, body) {
      expect(capturedMonitoringData.operationName).to.be.equal('/slow');
      expect(capturedMonitoringData.start).to.be.a('number');
      expect(capturedMonitoringData.timeToFirstByte).to.be.a('number');
      expect(capturedMonitoringData.finish).to.be.a('number');
      expect(capturedMonitoringData.timeout).to.be.an('undefined');
      expect(capturedMonitoringData.errors).to.be.empty;
      done();
    });
  });

  it("should capture timed out responses", function (done) {
    request.get('http://localhost:' + port + '/timeout', function (error, response, body) {
      console.log(capturedMonitoringData);
      expect(capturedMonitoringData.operationName).to.be.equal('/timeout');
      expect(capturedMonitoringData.start).to.be.a('number');
      expect(capturedMonitoringData.timeToFirstByte).to.be.a('number');
      expect(capturedMonitoringData.finish).to.be.a('number');
      expect(capturedMonitoringData.timeout).to.be.a('number');
      expect(capturedMonitoringData.errors).to.be.empty;
      done();
    });
  });

  it("should capture sync errors", function (done) {
    request.get('http://localhost:' + port + '/error-sync', function (error, response, body) {
      console.log(capturedMonitoringData);
      expect(capturedMonitoringData.operationName).to.be.equal('/error-sync');
      expect(capturedMonitoringData.start).to.be.a('number');
      expect(capturedMonitoringData.timeToFirstByte).to.be.a('number');
      expect(capturedMonitoringData.finish).to.be.a('number');
      expect(capturedMonitoringData.timeout).to.be.an('undefined');
      expect(capturedMonitoringData.errors).to.have.length(1);
      done();
    });
  });

  it("should capture async errors", function (done) {
    request.get('http://localhost:' + port + '/error-async', function (error, response, body) {
      expect(capturedMonitoringData.operationName).to.be.equal('/error-async');
      expect(capturedMonitoringData.start).to.be.a('number');
      expect(capturedMonitoringData.timeToFirstByte).to.be.a('number');
      expect(capturedMonitoringData.finish).to.be.a('number');
      expect(capturedMonitoringData.timeout).to.be.an('undefined');
      expect(capturedMonitoringData.errors).to.have.length(1);
      done();
    });
  });

});





