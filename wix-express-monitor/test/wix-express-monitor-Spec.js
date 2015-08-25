var request = require('request');
var chai = require('chai');
chai.use(require('./matchers'));
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





