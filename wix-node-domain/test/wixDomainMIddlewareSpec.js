var request = require('request'),
    expect = require('chai').expect,
  wixDomain = require('../index');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
var testApp = server.getApp();

testApp.use(wixDomain.wixDomainMiddleware());

testApp.use(function(req, res, next) {
  res.on('x-error', function(error) {
    res.status("500").send("we had an error - " + error.message);
  });
  next();
});

testApp.get('/domainName', function (req, res) {
    res.send(wixDomain.wixDomain().name);
});

testApp.get('/errorInAsyncFlow', function (req, res) {
  process.nextTick(function() {
    throw new Error('async bla!!!');
  });
});
testApp.get('/errorInSync', function (req, res) {
  throw new Error('sync bla!!!');
});

// error handler middleware has to be called last and as an err parameter first
testApp.use(wixDomain.expressErrorHandlerMiddleware);


describe("Wix Domain middleware", function () {

    server.beforeAndAfter();

    it("should track a request with Wix domain", function (done) {
        request.get('http://localhost:' + port + '/domainName', function (error, response, body) {
            expect(body).to.equal('wix-domain');
            done();
        });
    });

  it("should intercept errors and make sure errors are emitted on the HTTP response - async flow", function (done) {
    request.get('http://localhost:' + port + '/errorInAsyncFlow', function (error, response, body) {
      expect(body).to.equal('we had an error - async bla!!!');
      done();
    });
  });

  it("should intercept errors and make sure errors are emitted on the HTTP response - sync flow", function (done) {
    request.get('http://localhost:' + port + '/errorInSync', function (error, response, body) {
      expect(body).to.equal('we had an error - sync bla!!!');
      done();
    });
  });

});





