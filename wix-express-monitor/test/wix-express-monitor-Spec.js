var request = require('request');
var expect = require('chai').expect;
var serverResponsePatch = require('patch-server-response');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
server.getApp().get('/ok', function (req, res) {
  res.write('hi');
  res.end();
});
server.getApp().get('/error', function (req, res) {
  res.send('hi');
});
server.getApp().get('/timeout', function (req, res) {
  req.setTimeout(10, function() {
    res.emit("timeout");
  });
  res.status(504).send("timeout");
});



describe("patch-server-response .patch()", function () {

  server.beforeAndAfter();

  beforeEach(function() {
    serverResponsePatch.patch();
  });

  it("should emit the before-writing-headers event when using send", function (done) {
    request.get('http://localhost:' + port + '/send', function (error, response, body) {
      expect(response.headers).to.have.property('x-before-flushing-headers', 'triggered');
      done();
    });
  });

  it("should emit the before-writing-headers event when using write", function (done) {
    request.get('http://localhost:' + port + '/write', function (error, response, body) {
      expect(response.headers).to.have.property('x-before-flushing-headers', 'triggered');
      done();
    });
  });

  it("should emit the before-writing-headers event when using redirect", function (done) {
    request.get('http://localhost:' + port + '/redirect', function (error, response, body) {
      expect(response.headers).to.have.property('x-before-flushing-headers', 'triggered');
      done();
    });
  });
});





