// ignore the lint error of not having a function call.
// Mocha actually uses property getters as function calls (like .empty) and lint see those as errors by default
/*jshint -W030 */
var request = require('request');
var chai = require('chai');
var expect = chai.expect;
var serverResponsePatch = require('patch-server-response');
var wixDomain = require('wix-express-domain');
var wixExpressErrorCapture = require('wix-express-error-capture');
var expressTimeout = require('wix-express-timeout');

var expressMonitor = require("../wix-express-monitor");

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
var testApp = server.getApp();

serverResponsePatch.patch();
testApp.use(wixDomain.wixDomainMiddleware());
testApp.use(wixExpressErrorCapture.asyncErrorMiddleware);
testApp.use('/timeout', expressTimeout.middleware(10));

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
testApp.use(wixExpressErrorCapture.syncErrorMiddleware);

chai.Assertion.addProperty('aDateString', function() {
  var date = Date.parse(this._obj);
  this.assert(
    !isNaN(date),
    'expected #{this} to be a Date string',
    'expected #{this} to not be a Date string');
});

chai.Assertion.addProperty('asErrorMessages', function() {
  var self = this;
  var newArray = this._obj.map(function(error) {
    self.assert(
      error instanceof Error,
      'expected #{this} to be an instance of Error',
      'expected #{this} to not be an instance of Error');
    return error.message;
  });
  this._obj = newArray;
});

chai.Assertion.addMethod("metric", function metricAssertion(opts) {
  expect(this._obj.operationName, "metric.operationName").to.be.equal(opts.operationName);
  expect(this._obj.startTime, "metric.startTime").to.be.aDateString;
  expect(this._obj.timeToFirstByte, "metric.timeToFirstByte").to.be.a(opts.timeToFirstByte);
  expect(this._obj.finish, "metric.finish").to.be.a(opts.finish);
  expect(this._obj.timeout, "metric.timeout").to.be.an(opts.timeout);
  expect(this._obj.errors, "metric.errors").asErrorMessages.to.be.deep.equal(opts.errors);
});

describe("wix monitor", function () {

  server.beforeAndAfter();

  beforeEach(function() {
    capturedMonitoringData = undefined;
  });

  it("should capture ok response", function (done) {
    request.get('http://localhost:' + port + '/ok', function (error, response, body) {
      expect(capturedMonitoringData).to.be.a.metric({operationName: '/ok',
        timeToFirstByte: 'number',
        finish: 'number',
        timeout: 'undefined',
        errors: []
      });
      done();
    });
  });

  it("should capture slow responses", function (done) {
    request.get('http://localhost:' + port + '/slow', function (error, response, body) {
      expect(capturedMonitoringData).to.be.a.metric({operationName: '/slow',
        timeToFirstByte: 'number',
        finish: 'number',
        timeout: 'undefined',
        errors: []
      });
      done();
    });
  });

  it("should capture timed out responses", function (done) {
    request.get('http://localhost:' + port + '/timeout', function (error, response, body) {
      expect(capturedMonitoringData).to.be.a.metric({operationName: '/timeout',
        timeToFirstByte: 'number',
        finish: 'number',
        timeout: 'number',
        errors: []
      });
      done();
    });
  });

  it("should capture sync errors", function (done) {
    request.get('http://localhost:' + port + '/error-sync', function (error, response, body) {
      expect(capturedMonitoringData).to.be.a.metric({operationName: '/error-sync',
        timeToFirstByte: 'number',
        finish: 'number',
        timeout: 'undefined',
        errors: ["Sync error"]
      });
      done();
    });
  });

  it("should capture async errors", function (done) {
    request.get('http://localhost:' + port + '/error-async', function (error, response, body) {
      expect(capturedMonitoringData).to.be.a.metric({operationName: '/error-async',
        timeToFirstByte: 'number',
        finish: 'number',
        timeout: 'undefined',
        errors: ["Async error"]
      });
      done();
    });
  });

});





