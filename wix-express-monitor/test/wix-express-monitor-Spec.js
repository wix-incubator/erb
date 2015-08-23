var request = require('request');
var expect = require('chai').expect;
var serverResponsePatch = require('patch-server-response');
var expressMonitor = require("../wix-express-monitor");
var wixDomain = require('wix-node-domain');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
var testApp = server.getApp();

var capturedMonitoringData;
testApp.use(expressMonitor(function(monitor) {
  capturedMonitoringData = monitor;
}));
testApp.use(wixDomain.wixDomainMiddleware());

testApp.get('/ok', function (req, res) {
  console.log("hi");
  res.write('hi');
  res.end();
});
testApp.get('/slow', function (req, res) {
  res.append('an header', 'a value');
  process.setTimeout(function() {
    res.send("slow");
  }, 10);
});
testApp.get('/timeout', function (req, res) {
  req.setTimeout(10, function() {
    res.emit("timeout");
  });
});
testApp.get('/errorSync', function (req, res) {
  throw new Error('Sync error');
});
testApp.get('/errorAsync', function (req, res) {
  process.nextTick(function() {
    throw new Error('Async error');
  });
});
testApp.use(wixDomain.expressErrorHandlerMiddleware);




describe("wix monitor", function () {

  server.beforeAndAfter();

  beforeEach(function() {
    serverResponsePatch.patch();
  });

  it("should capture ok response", function (done) {
    request.get('http://localhost:' + port + '/ok', function (error, response, body) {
      expect(capturedMonitoringData).to.have.property('operationName', '/ok');
      expect(capturedMonitoringData).to.have.property('start').that.is.a('number');
      expect(capturedMonitoringData).to.have.property('timeToFirstByte').that.is.a('number');
      expect(capturedMonitoringData).to.have.property('finish').that.is.a('number');
      expect(capturedMonitoringData).to.have.property('timeout').that.is.an('undefined');
      /*jshint -W030 */ // ignore the lint error of not having a function call. Mocha actually uses the .empty as a getter function call
      expect(capturedMonitoringData).to.have.property('errors').that.is.empty;
      done();
    });
  });

});





