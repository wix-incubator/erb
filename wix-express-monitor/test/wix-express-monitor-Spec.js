// ignore the lint error of not having a function call.
// Mocha actually uses property getters as function calls (like .empty) and lint see those as errors by default
/*jshint -W030 */
var request = require('request');
var expect = require('chai').expect;
var serverResponsePatch = require('patch-server-response');
var wixDomain = require('wix-node-domain');
var expressTimeout = require('../wix-express-timeout');
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
  console.log("hi");
  res.write('hi');
  res.end();
});
testApp.get('/slow', function (req, res) {
  console.log("server", "slow");
  res.append('an header', 'a value');
  setTimeout(function() {
    res.send("slow");
  }, 10);
});
testApp.use('/timeout', expressTimeout.middleware(10));
testApp.get('/timeout', function (req, res) {
  console.log("server", "timeout");
  res.on('x-timeout', function() {
    res.status(504).send("timeout");
  });
});
testApp.get('/error-sync', function (req, res) {
  console.log("server", "error sync");
  throw new Error('Sync error');
});
testApp.get('/error-async', function (req, res) {
  console.log("server", "error async");
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
      expect(capturedMonitoringData).to.have.property('operationName', '/ok');
      expect(capturedMonitoringData).to.have.property('start').that.is.a('number');
      expect(capturedMonitoringData).to.have.property('timeToFirstByte').that.is.a('number');
      expect(capturedMonitoringData).to.have.property('finish').that.is.a('number');
      expect(capturedMonitoringData).to.have.property('timeout').that.is.an('undefined');
      expect(capturedMonitoringData).to.have.property('errors').that.is.empty;
      done();
    });
  });

  it("should capture slow responses", function (done) {
    request.get('http://localhost:' + port + '/slow', function (error, response, body) {
      expect(capturedMonitoringData).to.have.property('operationName', '/slow');
//      expect(capturedMonitoringData).to.have.property('start').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('timeToFirstByte').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('finish').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('timeout').that.is.an('undefined');
//      expect(capturedMonitoringData).to.have.property('errors').that.is.empty;
      done();
    });
  });

  it("should capture timed out responses", function (done) {
    request.get('http://localhost:' + port + '/timeout', function (error, response, body) {
      console.log("brbr");
      expect(capturedMonitoringData).to.have.property('operationName', '/slow');
//      expect(capturedMonitoringData).to.have.property('start').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('timeToFirstByte').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('finish').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('timeout').that.is.an('undefined');
//      expect(capturedMonitoringData).to.have.property('errors').that.is.empty;
      done();
    });
  });

  it("should capture sync errors", function (done) {
    request.get('http://localhost:' + port + '/error-sync', function (error, response, body) {
      expect(capturedMonitoringData).to.have.property('operationName', '/slow');
//      expect(capturedMonitoringData).to.have.property('start').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('timeToFirstByte').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('finish').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('timeout').that.is.an('undefined');
//      expect(capturedMonitoringData).to.have.property('errors').that.is.empty;
      done();
    });
  });

  it("should capture async errors", function (done) {
    request.get('http://localhost:' + port + '/error-async', function (error, response, body) {
      expect(capturedMonitoringData).to.have.property('operationName', '/slow');
//      expect(capturedMonitoringData).to.have.property('start').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('timeToFirstByte').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('finish').that.is.a('number');
//      expect(capturedMonitoringData).to.have.property('timeout').that.is.an('undefined');
//      expect(capturedMonitoringData).to.have.property('errors').that.is.empty;
      done();
    });
  });

});





