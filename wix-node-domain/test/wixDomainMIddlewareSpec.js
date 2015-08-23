var request = require('request'),
    expect = require('chai').expect,
    domainHelper = require('../index');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});

server.getApp().use(domainHelper.wixDomainMiddleware());

server.getApp().use(function(req, res, next) {
  res.on('x-error', function(error) {
    res.status("500").send("we had an error - " + error.message);
  });
  next();
});

server.getApp().get('/domainName', function (req, res) {
    res.send(domainHelper.wixDomain().name);
});

server.getApp().get('/errorInAsyncFlow', function (req, res) {
  process.nextTick(function() {
    throw new Error('async bla!!!');
  });
});
server.getApp().get('/errorInSync', function (req, res) {
  throw new Error('sync bla!!!');
});

// error handler middleware has to be called last and as an err parameter first
server.getApp().use(function(err, req, res, next) {
  res.emit('x-error', err);
});


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





